import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { userEntity } from './model/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([userEntity]),AuthModule],
  providers: [UserService],
  controllers:[UserController],
  exports:[UserService]
})
export class UserModule {}
