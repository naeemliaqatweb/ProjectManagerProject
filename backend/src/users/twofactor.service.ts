import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verify } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorService {
  async generateTwoFactorSecret(userEmail: string) {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'ProManage',
      label: userEmail,
      secret: secret,
    });

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataUrl(otpauthUrl: string) {
    return qrcode.toDataURL(otpauthUrl);
  }

  async isTwoFactorTokenValid(token: string, secret: string) {
    const result = await verify({ token, secret });
    return result.valid;
  }
}
