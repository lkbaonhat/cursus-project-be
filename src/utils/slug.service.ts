import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

@Injectable()
export class SlugService {
    createSlug(name: string): string {
        return slugify(name, { lower: true, strict: true });
    }
}