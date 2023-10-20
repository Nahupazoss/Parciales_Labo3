namespace Pazos 
{

    export class AutoBD extends Auto 
    {
        pathFoto : string;
    
        constructor(patente:string = "", marca:string = "", color:string = "", precio:number = 0, pathFoto:string = "") 
        {
            super(patente, marca, color,precio);
            this.pathFoto = pathFoto;
        }
    
        public ToJSON(): string 
        {
            return "{" + super.ToString() + ", " +`"pathFoto":"${this.pathFoto}"}`;
        }
    
    }
    
    }