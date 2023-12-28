import { Entity ,PrimaryGeneratedColumn,Column, BeforeInsert} from "typeorm";
import { UserRole } from "./user.interface";



@Entity()
export class userEntity {
@PrimaryGeneratedColumn()
id:number;
@Column()
name:string;
@Column({unique:true})
username:string;
@Column()
email:string;
@Column()
password:string;
@Column({nullable: true})
profileImage: string;
@Column({type:'enum',enum:UserRole,default:UserRole.USER})
role :UserRole;
@BeforeInsert()
emailToLowerCase(){
    this.email=this.email.toLowerCase();
}

}