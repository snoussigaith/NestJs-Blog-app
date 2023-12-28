import { Body, Controller, Delete, Get, Param, Put, Post, UseGuards, Request, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserRole, user } from '../model/user.interface';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Pagination } from 'nestjs-typeorm-paginate';

import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
export const storage = {
    storage: diskStorage({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`)
        }
    })

}

@Controller('user')
export class UserController {
    
    constructor( private userService :UserService){

    }
    @Post()
    create(@Body()user:user):Observable<user | object >{
        return this.userService.create(user).pipe(
            map((user:user)=> user),
                catchError(err => of({error: err.message}))
                
            
        );

    }
    @Post('login')
    login(@Body() user:user):Observable<object>{
        return this.userService.login(user).pipe(
            map((jwt:string)=> {
                return {access_token:jwt};
            })
        )
    }
    @Get(':id')
    findOne(@Param()params):Observable<user>{
        return this.userService.findOne(params.id);
    }
  
    @Get()
    index( @Query('page') 
    page: number = 1,
    @Query('limit') 
    limit: number = 10,
    @Query('username') username:string
    ):Observable<Pagination<user>>{
        limit = limit > 100 ? 100 : limit;
        console.log(username);
        if (username === null || username === undefined) {
    return this.userService.paginate({
      page,
      limit,
      route: 'http://localhost:3000/api/user/',
    });
    }else {
        return this.userService.paginateFilterByUsername(
            { page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/user/' },
            { username }
        )
    }
    }
    @Delete(':id')
    deleteOne(@Param('id')id:string):Observable<user>{
        return this.userService.deleteOne(Number(id));
    }
    @Put(':id')
    updateOne(@Param('id')id:string,@Body()user:user):Observable<any>{
        return this.userService.updateOne(Number(id),user);
    }
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Put(':id/role')
    updateRoleOfUser(@Param('id')id:string,@Body()user:user):Observable<user>{
        return this.userService.updateRoleOfUser(Number(id),user);
    }
    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
        const user: user = req.user;

        return this.userService.updateOne(user.id, {profileImage: file.filename}).pipe(
            tap((user: user) => console.log(user)),
            map((user:user) => ({profileImage: user.profileImage}))
        )
    }

}
