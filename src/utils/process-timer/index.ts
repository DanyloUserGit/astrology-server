export interface ProcessTimer{
    start:()=>void,
    markStep:(msg:string)=>void,
    end:()=>void
}