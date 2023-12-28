import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServicesService } from './services/services.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/role.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { UserModule } from 'src/user/user.module';

@Module({
    imports:[
        forwardRef(()=> UserModule),
        JwtModule.registerAsync({
        imports:[ConfigModule],
        inject:[ConfigService],
        useFactory: async (configService:ConfigService)=>({
            secret:'flghdfslghmdfshg',
            signOptions:{expiresIn:'100s'}
        })
    })],
    providers:[ServicesService,JwtAuthGuard,RolesGuard,JwtStrategy],
    exports:[ServicesService]
})
export class AuthModule {}
