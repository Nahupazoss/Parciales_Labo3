namespace Pazos
{
    export class Auto
    {
        public marca : string;
        public patente : string;
        public color : string;
        public precio : number;

        public constructor(marca : string, patente : string, color : string, precio : number)
        {
            this.marca = marca;
            this.patente = patente;
            this.color = color;
            this.precio = precio;
        }

        public ToString(): string {
            return `"patente":"${this.patente}", "marca":"${this.marca}", "color":"${this.color}", "precio":${this.precio}`;
        }
        
        public ToJSON(): string {
            return "{" + this.ToString() + "}";
        }
    }
}