import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from './entities/user.entity';
import {Repository} from 'typeorm';
import {PayloadInterface} from './interface/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRespository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'yesser_secret',
        });
    }

    async validate(payload: PayloadInterface) {
        const user = await this.userRespository.findOneBy({
            username: payload.username,
        });
        if (user) {
            const {password, salt, ...result} = user;
            return result;
        } else {
            throw new UnauthorizedException();
        }
    }
}
