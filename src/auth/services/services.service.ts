import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from, of } from 'rxjs';
import { user } from 'src/user/model/user.interface';
const bcrypt= require('bcrypt');

@Injectable()
export class ServicesService {
    constructor(private readonly jwtService:JwtService){

    }
    generateJWT(user:user):Observable<string>{
        return from(this.jwtService.signAsync({user}));
    }
    hashPassword(password:string):Observable<string>{
        return from<string>(bcrypt.hash(password,12));
    }
    comparePasswords(newPassword:string,passwordHash:string):Observable<any|boolean>{
        return of<any | boolean>(bcrypt.compare(newPassword,passwordHash));
    }
}
