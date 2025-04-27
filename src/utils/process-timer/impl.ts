import { ProcessTimer } from ".";

export class ProcessTimerImpl implements ProcessTimer{
    private timeStart:number;
    private timeEnd:number;
    private steps:string[];

    constructor () {
        this.timeStart = 0;
        this.timeEnd = 0;
        this.steps = [];
    }
    start(){
        this.timeStart = performance.now();
        console.log("Timer started");
    }
    markStep(msg: string){
        this.steps.push(msg);
        const step = this.steps.indexOf(msg);

        console.log(`${step}: ${msg}`);
    }
    end(){
        this.timeEnd = performance.now();
        console.log(`Used marks: ${this.steps.length}`);

        const totalTime = (this.timeEnd-this.timeStart)/1000; //seconds
        console.log(`Total time: ${totalTime}s`);
    }
}