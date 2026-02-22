import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityService } from '../../activity/activity.service';
import { TasksService } from '../../tasks/tasks.service';
import { ColumnsService } from '../../columns/columns.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(
    private activityService: ActivityService,
    private tasksService: TasksService,
    private columnsService: ColumnsService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers, params } = request;

    return next.handle().pipe(
      tap(async (response) => {
        // Only log successful mutation requests
        if (method === 'GET') return;

        try {
          const userId =
            headers?.['x-user-id'] || body?.userId || response?.userId;
          if (!userId) return;

          let action = '';
          let projectId = '';
          let details = '';

          const isTaskRoute = url.includes('/tasks');
          const isColumnRoute = url.includes('/columns');

          if (isTaskRoute) {
            if (method === 'POST') {
              action = 'TASK_CREATED';
              details = `Created task: ${response.title}`;
              const column = await this.columnsService.findOne(
                response.columnId,
              );
              projectId = column?.projectId || '';
            } else if (method === 'PATCH') {
              const task = (await this.tasksService.findOne(params.id)) as any;
              projectId = task?.column?.projectId || '';

              if (body.columnId && task && body.columnId !== task.columnId) {
                action = 'TASK_MOVED';
                const toColumn = await this.columnsService.findOne(
                  body.columnId,
                );
                details = `Moved task "${response.title}" to ${toColumn?.title}`;
              } else {
                action = 'TASK_UPDATED';
                details = `Updated task: ${response.title}`;
              }
            } else if (method === 'DELETE') {
              action = 'TASK_DELETED';
              details = `Deleted a task`;
              // Note: projectId might be hard to get after delete if not in body
            }
          } else if (isColumnRoute) {
            if (method === 'POST') {
              action = 'COLUMN_CREATED';
              details = `Created column: ${response.title}`;
              projectId = response.projectId || '';
            } else if (method === 'PATCH') {
              action = 'COLUMN_UPDATED';
              details = `Updated column: ${response.title}`;
              const column = await this.columnsService.findOne(params.id);
              projectId = column?.projectId || '';
            }
          } else if (url.includes('/projects/') && url.includes('/share')) {
            if (method === 'POST') {
              action = 'PROJECT_SHARED';
              details = `Shared project with ${body.email}`;
              projectId = params.projectId || params.id;
            }
          }

          // Fallback to body/response for projectId
          projectId = projectId || body.projectId || response.projectId;

          if (action && projectId && userId) {
            await this.activityService.create({
              action,
              details,
              userId,
              projectId,
            });
          }
        } catch (error) {
          console.error('Activity Logging Error:', error);
        }
      }),
    );
  }
}
