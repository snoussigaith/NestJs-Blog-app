import { Injectable } from '@nestjs/common';
import { userEntity } from '../model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UserRole, user } from '../model/user.interface';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { ServicesService } from 'src/auth/services/services.service';
import {
    paginate,
    Pagination,
    IPaginationOptions,
  } from 'nestjs-typeorm-paginate';
  

@Injectable()
export class UserService {
    constructor (
        @InjectRepository(userEntity) private readonly userRepository : Repository<userEntity>, private authService:ServicesService
    ){}
    create (user:user):Observable<user>{
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash:string) => {
                const newUser = new userEntity();
                newUser.name=user.name;
                newUser.username=user.username;
                newUser.email=user.email;
                newUser.password=passwordHash;
                newUser.role=UserRole.USER;
                return from(this.userRepository.save(newUser)).pipe(
                    map((user:user) => {
                        console.log(user);
                        const {password, ...result}= user;
                        return result;
                    }),
                    catchError((err) => throwError(() => err))
                )

            }
            )
        )
        //return from(this.userRepository.save(user));
    }
    findOne(id:number):Observable<user>{
        return from(this.userRepository.findOne({where:{id}})).pipe(
            map((user:user) => {
                const {password, ...result}= user;
                return result;
            }),
        );
    }
    findall (): Observable<user[]>{
        return from(this.userRepository.find()).pipe(
            map((users:user[])=> {
                users.forEach(function (v){delete v.password});
                return users;
            })
        );
    }

    paginate(options: IPaginationOptions):Observable<Pagination<user>>{
        return from(paginate<user>(this.userRepository,options)).pipe(
            map((usersPageable : Pagination<user>)=>{
                usersPageable.items.forEach(function (v){delete v.password});
                return usersPageable;

            })
        )
    }
    paginateFilterByUsername(options: IPaginationOptions, user: user): Observable<Pagination<user>>{
        return from(this.userRepository.findAndCount({
            skip: Number(options.page) * Number(options.limit) || 0,
            take: Number(options.limit) || 10,
            order: {id: "ASC"},
            select: ['id', 'name', 'username', 'email', 'role'],
            where: [
                { username: Like(`%${user.username}%`)}
            ]
        })).pipe(
            map(([users, totalUsers]) => {
                const usersPageable: Pagination<user> = {
                    items: users,
                    links: {
                        first: options.route + `?limit=${options.limit}`,
                        previous: options.route + ``,
                        next: options.route + `?limit=${options.limit}&page=${Number(options.page) + 1}`,
                        last: options.route + `?limit=${options.limit}&page=${Math.ceil(totalUsers / Number(options.limit))}`
                    },
                    meta: {
                        currentPage: Number(options.page),
                        itemCount: users.length,
                        itemsPerPage: Number(options.limit),
                        totalItems: totalUsers,
                        totalPages: Math.ceil(totalUsers / Number(options.limit))
                    }
                };              
                return usersPageable;
            })
        )
    }

    deleteOne(id:number): Observable<any>{
        return from(this.userRepository.delete(id));
    }
    updateOne(id: number,user:user):Observable<any>{
        delete user.email;
        delete user.password;
        delete user.role;
        return from(this.userRepository.update(id,user)).pipe(
            switchMap(() => this.findOne(id))
        );;
    }
    updateRoleOfUser(id : number,user:user):Observable<any>{
        return from(this.userRepository.update(id,user));
    }




    login(user:user):Observable<string>{
        return this.validateUser(user.email,user.password).pipe(
            switchMap((user:user)=> {
                if(user){
                    return this.authService.generateJWT(user).pipe(
                        map((jwt : string)=> jwt)
                    );
                }else{
                    return 'wrong credentials'
                }
            })
        )

    }
    validateUser(email:string,password:string):Observable<user>{
        return this.findByMail(email).pipe(
            switchMap((user:user)=> this.authService.comparePasswords(password,user.password).pipe(
                map((match : boolean)=>{
                    if(match){
                        const {password, ...result} = user;
                        return result;
                    }else{
                        throw Error;
                    }
                })
            ))
            
        )
    }
    findByMail(email: string):Observable<user> {
        return from(this.userRepository.findOne({where:{email}}));
    }
}
