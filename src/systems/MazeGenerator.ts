import { Random } from "excalibur";

export class MazeGenerator {
    static generateLevel(seed: number): string[][] {
        const RNGmapa = new Random(seed);
    
        const D: number[][] = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
        ];
    
        let labirinto: string[][] = [
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
    
        let visitados: boolean[][] = [];
        for (let linha = 0; linha < (labirinto.length + 1) / 2; linha++) {
            visitados[linha] = [];
            for (let coluna = 0; coluna < labirinto[0].length / 2; coluna++)
            visitados[linha][coluna] = false;
        }
    
        function celValida(
            matriz: any[][],
            linha: number,
            coluna: number,
        ): boolean {
            if (
            linha < 0 ||
            linha >= matriz.length ||
            coluna < 0 ||
            coluna >= matriz[0].length
            )
            return false;
            return true;
        }
    
        function nVizinhos(
            visitados: boolean[][],
            linha: number,
            coluna: number,
        ): number {
            //conta vizinhos não visitados
            var numero: number = 0;
            for (let i = 0; i < 4; i++)
            if (
                celValida(visitados, linha + D[i][0], coluna + D[i][1]) &&
                !visitados[linha + D[i][0]][coluna + D[i][1]]
            )
                numero += 1 << i;
            return numero;
        }
    
        function direcaoVizinho(matriz: string[][], lCel: number, cCel: number) {
            //base: coordenadas do labirinto
            let direcoes: number[] = [];
            const valor = Number(matriz[lCel][cCel]);
            for (let i = 0; i < D.length; i++)
            if ((valor >> i) & 1) direcoes[direcoes.length] = i;
            return [...D[direcoes[RNGmapa.integer(0, direcoes.length - 1)]]];
        }
    
        //escolhe a célula inicial, mas poderia ser escolhida ao acaso
    
        let lCel = 2*RNGmapa.integer(0,4);
        let cCel = 2*RNGmapa.integer(0,8);
        console.log(lCel + " e " + cCel);
        let direcao: number[] = [0, 0];
    
        labirinto[lCel][cCel] = String(nVizinhos(visitados, lCel / 2, cCel / 2)); // divide por 2 para usar as coordenadas da matriz de visitados, que é menor que a do labirinto
    
        //geração do labirinto
    
        while (visitados.some((linha) => linha.includes(false))) {
            visitados[lCel / 2][cCel / 2] = true;
    
            while (nVizinhos(visitados, lCel / 2, cCel / 2) > 0) {
            direcao = direcaoVizinho(labirinto, lCel, cCel);
    
            labirinto[lCel + direcao[0]][cCel + direcao[1]] = "0"; //parede vira chão
    
            lCel += 2 * direcao[0];
            cCel += 2 * direcao[1];
    
            visitados[lCel / 2][cCel / 2] = true;
            labirinto[lCel][cCel] = String(
                nVizinhos(visitados, lCel / 2, cCel / 2),
            );
    
            for (let i = 0; i < 4; i++) {
                if (
                celValida(visitados, lCel / 2 + D[i][0], cCel / 2 + D[i][1]) &&
                celValida(labirinto, lCel + 2 * D[i][0], cCel + 2 * D[i][1]) &&
                visitados[lCel / 2 + D[i][0]][cCel / 2 + D[i][1]]
                ) {
                labirinto[lCel + 2 * D[i][0]][cCel + 2 * D[i][1]] = String(
                    nVizinhos(visitados, lCel / 2 + D[i][0], cCel / 2 + D[i][1]),
                );
                }
            }
            }
    
            for (let linha = 0; linha < labirinto.length; linha += 2)
            for (let coluna = 0; coluna < labirinto[0].length; coluna += 2)
                if (Number(labirinto[linha][coluna]) > 0) {
                lCel = linha;
                cCel = coluna;
                if (celValida(visitados, lCel / 2, cCel / 2))
                    visitados[lCel / 2][cCel / 2] = true;
                labirinto[lCel][cCel] = String(
                    nVizinhos(visitados, lCel / 2, cCel / 2),
                );
                }
        }
    
        for (let linha = 0; linha < labirinto.length; linha++)
            for (let coluna = 0; coluna < labirinto[0].length; coluna++)
            if (Number(labirinto[linha][coluna]) == 0)
                labirinto[linha][coluna] = " ";
    
        for (let linha = 0; linha < labirinto.length; linha += 2) for (let coluna = 1; coluna < labirinto[0].length; coluna += 2) if (RNGmapa.integer(1, 100) < 60) labirinto[linha][coluna] = " ";
        for (let linha = 1; linha < labirinto.length; linha += 2) for (let coluna = 0; coluna < labirinto[0].length; coluna += 2) if (RNGmapa.integer(1, 100) < 60) labirinto[linha][coluna] = " ";
        for (let linha = 1; linha < labirinto.length; linha += 2) for (let coluna = 1; coluna < labirinto[0].length; coluna += 2) {
            var conectada = false;
            for (let k = 0; k < D.length; k++) 
                if (celValida(labirinto, linha + D[k][0], coluna + D[k][1]) &&
                labirinto[linha + D[k][0]][coluna + D[k][1]] == "w")
                conectada = true;
            if (!conectada) labirinto[linha][coluna] = " ";
        }
    
        //conversão de labirinto para level
    
        let level: string[][] = [];
    
        for (let linha = 0; linha < 27; linha++) {
            level[linha] = [];
            for (let coluna = 0; coluna < 48; coluna++) level[linha][coluna] = " ";
        }
    
        for (let linha = 0; linha < labirinto.length; linha += 2) {
            for (let coluna = 1; coluna < labirinto[0].length; coluna += 2)
            level[5 * (linha / 2) + 2][(5 * (1 + coluna)) / 2 + 1] =
                labirinto[linha][coluna];
            for (let repeteLin = 1; repeteLin < 4; repeteLin++) {
            level[5 * (linha / 2) + 2 + repeteLin] = [
                ...level[5 * (linha / 2) + 2],
            ];
            }
        }
    
        for (let linha = 1; linha < labirinto.length; linha += 2) {
            for (let coluna = 1; coluna < labirinto[0].length; coluna += 2)
            level[(5 * (1 + linha)) / 2 + 1][(5 * (1 + coluna)) / 2 + 1] =
                labirinto[linha][coluna];
            for (let coluna = 0; coluna < labirinto[0].length; coluna += 2)
            for (let repeteCol = 0; repeteCol < 4; repeteCol++)
                level[(5 * (1 + linha)) / 2 + 1][5 * (coluna / 2) + 2 + repeteCol] =
                labirinto[linha][coluna];
        }
    
        level[ 0][21] = level[ 0][26] = "w";
        level[11][ 0] = level[16][ 0] = "w";
        level[11][47] = level[16][47] = "w";
        for (let coluna = 1; coluna < level[0].length - 1; coluna++) level[ 1][coluna] = "w";
        for (let linha = 1; linha < level.length; linha++) level[linha][ 1] = "w";
        for (let linha = 1; linha < level.length; linha++) level[linha][46] = "w";
        for (let coluna = 1; coluna < level[0].length - 1; coluna++) level[26][coluna] = "w";
        for (let coluna = 22; coluna <= 25; coluna++) level[ 1][coluna] = "d";
        for (let linha = 12; linha <= 15; linha++) level[linha][ 1] = "d";
        for (let linha = 12; linha <= 15; linha++) level[linha][46] = "d";
        for (let coluna = 22; coluna <= 25; coluna++) level[26][coluna] = "d";
    
        //fim da conversão de labirinto para level

        return level;
        
    }
}