import { CanActivate, ExecutionContext, Inject, Injectable, forwardRef } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, map } from "rxjs";
import { user } from "src/user/model/user.interface";
import { UserService } from "src/user/service/user.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector:Reflector,
        @Inject(forwardRef(()=> UserService))
        private userService:UserService){}
  canActivate(context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean>{
    const roles = this.reflector.get('roles', context.getHandler());
    if (!roles) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      
      const user = request.user;
      console.log(user);

      return this.userService.findOne(user.id).pipe(
        map((user:user)=>{
            const hasRoles = () => roles.indexOf(user.role) > -1;
            let hasPermission:boolean =false;
            console.log(hasRoles);
            if(hasRoles){
              console.log('has role true');
              hasPermission=true
            };
            return user && hasPermission;
        })
      )



     
  }
  }
