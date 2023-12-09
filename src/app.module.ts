import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
const ormOptions: TypeOrmModuleOptions ={
  type: 'mysql',
  host:'localhost',
  port : 3306,
  username: 'root',
  password:'',
  database:'blogdb',
  autoLoadEntities:true,
  synchronize:true,
  
}
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRoot(ormOptions)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
