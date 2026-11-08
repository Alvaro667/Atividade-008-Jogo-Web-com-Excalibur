import { DefaultLoader, Engine, ExcaliburGraphicsContext, Random, Scene, SceneActivationContext, SpriteSheet, TileMap } from "excalibur";
import { Player } from "../actors/Player";
import { Resources } from "../resources/resources";

export class GameScene extends Scene {
    override onInitialize(engine: Engine): void {
        
        // Load your favorite tileset (maybe from Kenney.nl)
        const kenneyRougeLikePack = Resources.Tiles;
        
        // Create a sprite sheet
        const rougeLikeSpriteSheet = SpriteSheet.fromImageSource({
            image: kenneyRougeLikePack,
            grid: {
                rows: 12,
                columns: 11,
                spriteHeight: 16,
                spriteWidth: 16
            },
            spacing: {
                margin: {
                    x: 1,
                    y: 1
                }
            }
        });
        
        // Create a tilemap
        const tilemap = new TileMap({ //compare com as dimensões do mapa do jogo
            rows: 9*3,
            columns: 16*3,
            tileWidth: 16,
            tileHeight: 16,
        });
        
        const floor = rougeLikeSpriteSheet.getSprite(0, 0);
        const wall = rougeLikeSpriteSheet.getSprite(4, 3);
        const door = rougeLikeSpriteSheet.getSprite(9, 3);
        
        /*var level: string[] = [
            "                     w    w                     ",
            " wwwwwwwwwwwwwwwwwwwwwddddwwwwwwwwwwwwwwwwwwwww ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            " d    w    w    w    w    w    w    w    w    d ",
            " d    w    w    w    w    w    w    w    w    d ",
            " d    w    w    w    w    w    w    w    w    d ",
            " d    w    w    w    w    w    w    w    w    d ",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " wwwwwwwwwwwwwwwwwwwwwddddwwwwwwwwwwwwwwwwwwwww "
        ]*/
        
        const seed: number = new Random(12345).integer(0, 10000);

        var labirinto: string[][] = [
            [" ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," "],
            ["w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w"],
            [" ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," "],            
            ["w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w"],
            [" ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," "],            
            ["w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w"],
            [" ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," "],
            ["w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w"],   
            [" ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," ","w"," "],
        ]

        var visitados: boolean[][] = [];
        
        for(let linha = 0; linha < (labirinto.length + 1)/2; linha++){
            visitados[linha] = [];
            for(let coluna = 0; coluna < (labirinto[0].length)/2; coluna++) visitados[linha][coluna] = false;
        }
        
        
        const D: number[][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        function celValida(matriz: any[][], linha: number, coluna: number): boolean{
            if(linha < 0 || linha >= matriz.length || coluna < 0 || coluna >= matriz[0].length) return false;
            return true;
        }

        function nVizinhos(visitados: boolean[][], linha: number, coluna: number): number{ //conta vizinhos não visitados
            var numero: number = 0;
            for(let i = 0; i < 4; i++) if(celValida(visitados, linha + D[i][0], coluna + D[i][1]) && ! visitados[linha + D[i][0]][coluna + D[i][1]]) numero += 1 << i;
            return numero;
        }

        function direcaoVizinho(matriz: string[][], visitados: boolean[][], lCel: number, cCel: number): number[] { // use as coordenadas do booleano
            let rota = new Random(seed + matriz.length * lCel + cCel).integer(0, 3);
            let direcao: number[] = [0, 0];
            let achouValido: boolean = false;
            loop: for(let tentativas = 0; tentativas < 4; tentativas++){
                direcao = [...D[rota]];
                if(! celValida(visitados, lCel + direcao[0], cCel + direcao[1]) || visitados[lCel + direcao[0]][cCel + direcao[1]]){
                    direcao = [0, 0];
                    rota = (rota + 1)%4;
                    continue loop;
                } else {
                    achouValido = true;
                    break loop;
                }
            }
            if(!achouValido){
                console.log("Não achou rota válida");
                direcao = [0, 0];
            }
            return direcao;
        }

        var lCel = 0;
        var cCel = 0;
        var direcao: number[] = [0, 0];
        
        labirinto[lCel][cCel] = String(nVizinhos(visitados, lCel/2, cCel/2)); // divide por 2 para usar as coordenadas da matriz de visitados, que é menor que a do labirinto
        
        
        while(visitados.some(linha => linha.includes(false))){
            
            visitados[lCel/2][cCel/2] = true;

            while(nVizinhos(visitados, lCel/2, cCel/2) > 0){


                direcao = direcaoVizinho(labirinto, visitados, lCel/2, cCel/2);

                labirinto[lCel + direcao[0]][cCel + direcao[1]] = "0"; //parede vira chão

                lCel += 2*direcao[0];
                cCel += 2*direcao[1];

                visitados[lCel/2][cCel/2] = true;
                labirinto[lCel][cCel] = String(nVizinhos(visitados, lCel/2, cCel/2));

                for(let i = 0; i < 4; i++) {
                    if(celValida(visitados, lCel/2 +D[i][0], cCel/2 +D[i][1]) && celValida(labirinto, lCel + 2*D[i][0], cCel +2*D[i][1]) && visitados[lCel/2 +D[i][0]][cCel/2 +D[i][1]]){
                        labirinto[lCel +2*D[i][0]][cCel +2*D[i][1]] = String(nVizinhos(visitados, lCel/2 +D[i][0], cCel/2 +D[i][1]));
                    }
                }
            }

            for(let linha = 0; linha < labirinto.length; linha+=2) for (let coluna = 0; coluna < labirinto[0].length; coluna+=2) if(Number(labirinto[linha][coluna]) > 0){
                lCel = linha;
                cCel = coluna;
                if(celValida(visitados, lCel/2, cCel/2)) visitados[lCel/2][cCel/2] = true;
                labirinto[lCel][cCel] = String(nVizinhos(visitados, lCel/2, cCel/2));
            }
        }

        for(let linha = 0; linha < labirinto.length; linha++) for(let coluna = 0; coluna < labirinto[0].length; coluna++) if(Number(labirinto[linha][coluna]) == 0) labirinto[linha][coluna] = " ";

        
        console.log(labirinto);
        
        console.log(visitados);


        var level: string[][] = [];

        for(let linha = 0; linha < 27; linha++){
            level[linha] = [];
            for(let coluna = 0; coluna < 48; coluna++) level[linha][coluna] = " ";
        }

        /*for(let linha = 0; linha < labirinto.length; linha+=2) { //linhas e colunas do labirinto
            for(let coluna = 0; coluna < labirinto[0].length; coluna+=2) {
                console.log("Valor: " + labirinto[linha][coluna] + ", linha: " + linha + ", coluna: " + coluna);
                for(let repeteCol = 0; repeteCol < 4; repeteCol++){
                    console.log("level[" + (5*(linha/2) + 2) + "][" + (5*(coluna/2) + 2 + repeteCol) + "] = labirinto[" + linha + "][" + coluna + "]");
                    level[5*(linha/2) + 2][5*(coluna/2) + 2 + repeteCol] = labirinto[linha][coluna];
                }
            }
            for(let repeteLin = 1; repeteLin < 4; repeteLin++){
                level[5*(linha/2) + 2 + repeteLin] = [...level[5*(linha/2) + 2]];
            }
        }*/

        for(let linha = 0; linha < labirinto.length; linha+=2){
            for(let coluna = 1; coluna < labirinto[0].length; coluna+=2) level[5*(linha/2) + 2][5*(1 + coluna)/2 + 1] = labirinto[linha][coluna];
            for(let repeteLin = 1; repeteLin < 4; repeteLin++){
                level[5*(linha/2) + 2 + repeteLin] = [...level[5*(linha/2) + 2]];
            }
        }

        for(let linha = 1; linha < labirinto.length; linha+=2){
            for(let coluna = 1; coluna < labirinto[0].length; coluna+=2) level[5*(1 + linha)/2 + 1][5*(1 + coluna)/2 + 1] = "w";
            for(let coluna = 0; coluna < labirinto[0].length; coluna+=2) for(let repeteCol = 0; repeteCol < 4; repeteCol++) level[5*(1 + linha)/2 + 1][5*(coluna/2) + 2 + repeteCol] = labirinto[linha][coluna];
        }
        
        console.log(labirinto);
        
        console.log(level);

        //console.log(level);

        /*
        (0, 17) [' ', 'w', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', ' '] l = 0, c = 0 até l = 0, c = 16
        (1, 17) [' ', 'w', 'w', 'w', ' ', 'w', 'w', 'w', 'w', 'w', ' ', 'w', ' ', 'w', 'w', 'w', ' '] 
        (2, 17) [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w', ' ', 'w', ' ', ' ', ' ', 'w', ' ']
        (3, 17) ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', ' ', 'w', ' ', 'w', 'w', 'w', ' ', 'w', ' ']
        (4, 17) [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', ' ', 'w', ' ', 'w', ' '] 
        (5, 17) [' ', 'w', 'w', 'w', 'w', 'w', ' ', 'w', 'w', 'w', 'w', 'w', ' ', 'w', ' ', 'w', ' ']
        (6, 17) [' ', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', 'w', ' ']
        (7, 17) ['w', 'w', 'w', 'w', ' ', 'w', 'w', 'w', 'w', 'w', ' ', 'w', 'w', 'w', 'w', 'w', ' ']
        (8, 17) [' ', ' ', ' ', ' ', ' ', 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] l = 8, c = 0 até l = 8, c = 16
                l = 0, c = 0 até l = 8, c = 0                         l = 0, c = 16 até l = 8, c = 16       linhas(0 ~ 8) colunas(0 ~ 16)
        */

        // linha 0 => 2~5, 1 => 6, 2 => 7~10, 3 => 11, 4 => 12~15 


        /*var level: string[] = [
            "                     w    w                     ",
            " wwwwwwwwwwwwwwwwwwwwwddddwwwwwwwwwwwwwwwwwwwww ",
            " w    w    w    w    w    w    w    w    w    w ", l = 2, c = 2, 0, 0 no labirinto
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ", l = 5, c = 5
            " wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww ", l = 6, c = 2, 1, 0 no labirinto
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            " d    w    w    w    w    w    w    w    w    d ",
            " d    w    w    w    w    w    w    w    w    d ",
            " d    w    w    w    w    w    w    w    w    d ",
            " d    w    w    w    w    w    w    w    w    d ",
            "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " w    w    w    w    w    w    w    w    w    w ",
            " wwwwwwwwwwwwwwwwwwwwwddddwwwwwwwwwwwwwwwwwwwww "       linhas(2 ~ 25) colunas(2 ~ 45)     

            0,0  => 2,2 ~ 5,5
            0,1  => 2,6 ~ 5,6
            1,0  => 6,2 ~ 6,5
            1,1  => 6,6
            2,0  => 7,2 ~ 10,5
            2,1  => 7,6 ~ 10,6
            2,2  => 7,7 ~ 10,10
            8,16 => 22,42 ~ 25,45

        ]*/






        if(floor && wall && door){
            for(let y = 0; y < level.length; y++) {
                for(let x = 0; x < level[y].length; x++) {
                    const tileChar = level[y][x];
                    let tile = tilemap.getTile(x, y);
                    if(tile == null){
                        console.error("Tile nulo!");
                    } else switch(tileChar) {
                        case ' ':
                            tile.addGraphic(floor);
                            break;
                        case 'w':
                            tile.addGraphic(wall);
                            tile.solid = true;
                            break;
                        case 'd':
                            tile.addGraphic(door);
                            tile.solid = true;
                            break;                                                
                        default:
                            console.log("Tile não declarado: " + tileChar);
                            tile.addGraphic(floor);
                            break;
                    }
                }
            }
        }
        
        // Scene.onInitialize is where we recommend you perform the composition for your game
        const player = new Player();
        this.add(player);
        this.add(tilemap); // Actors need to be added to a scene to be drawn
    }

    override onPreLoad(loader: DefaultLoader): void {
        // Add any scene specific resources to load
    }

    override onActivate(context: SceneActivationContext<unknown>): void {
        // Called when Excalibur transitions to this scene
        // Only 1 scene is active at a time
    }

    override onDeactivate(context: SceneActivationContext): void {
        // Called when Excalibur transitions away from this scene
        // Only 1 scene is active at a time
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        // Called before anything updates in the scene
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        // Called after everything updates in the scene
    }

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called before Excalibur draws to the screen
    }

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called after Excalibur draws to the screen
    }
}