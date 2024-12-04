import { Controller, Post } from "@nestjs/common";

@Controller('question')
export class QuestionController {
    constructor() {}
    
    @Post('/create')
    create() {
        return 'This action adds a new question';
    }
}
