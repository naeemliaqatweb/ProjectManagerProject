import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

import { TwoFactorService } from './twofactor.service';

import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly twoFactorService: TwoFactorService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(
    @Body()
    loginDto: {
      email: string;
      password: string;
      twoFactorToken?: string;
    },
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      if (!loginDto.twoFactorToken) {
        return { requires2fa: true, userId: user.id };
      }

      const isTokenValid = await this.twoFactorService.isTwoFactorTokenValid(
        loginDto.twoFactorToken,
        user.twoFactorSecret || '',
      );

      if (!isTokenValid) {
        throw new NotFoundException('Invalid 2FA token');
      }
    }

    return this.authService.login(user);
  }

  @Get('me')
  async findMe() {
    // Mocked Auth: Return the first available user (seeded user)
    const user = await this.usersService.findFirst();
    if (!user) {
      throw new NotFoundException('No users found. Please seed the database.');
    }
    return user;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post(':id/update')
  async update(@Param('id') id: string, @Body() data: Prisma.UserUpdateInput) {
    return this.usersService.update(id, data);
  }

  @Post(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.usersService.updatePassword(id, password);
  }

  @Post(':id/2fa/generate')
  async generate2fa(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    const { secret, otpauthUrl } =
      await this.twoFactorService.generateTwoFactorSecret(user.email);
    const qrCode =
      await this.twoFactorService.generateQrCodeDataUrl(otpauthUrl);

    return { secret, qrCode };
  }

  @Post(':id/2fa/enable')
  async enable2fa(
    @Param('id') id: string,
    @Body() body: { secret: string; token: string },
  ) {
    const isTokenValid = await this.twoFactorService.isTwoFactorTokenValid(
      body.token,
      body.secret,
    );

    if (!isTokenValid) {
      throw new NotFoundException('Invalid verification token');
    }

    return this.usersService.update(id, {
      twoFactorSecret: body.secret,
      twoFactorEnabled: true,
    } as any);
  }

  @Post(':id/2fa/disable')
  async disable2fa(@Param('id') id: string) {
    return this.usersService.update(id, {
      twoFactorSecret: null,
      twoFactorEnabled: false,
    } as any);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(`Uploading avatar for user ${id}: ${file.filename}`);
    const imageUrl = `/uploads/${file.filename}`;
    const updatedUser = await this.usersService.update(id, {
      image: imageUrl,
    } as any);
    console.log(`Updated user ${id} with image ${imageUrl}`);
    return updatedUser;
  }
}
