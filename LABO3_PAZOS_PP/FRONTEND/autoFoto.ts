namespace Pazos
{
    export class AutoFoto extends Auto
    {
        private foto : string;

        public constructor(marca : string, patente : string, color : string, precio : number, foto : string)
        {
            super(marca, patente, color, precio);
            this.foto = foto;
        }
    }
}