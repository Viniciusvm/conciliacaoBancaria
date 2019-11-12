angular.module('conciliacaoApp', [])
  .controller('ConciliacaoController',['$scope', function($scope) {
    var conciliacao = this;
    
    conciliacao.excluirColuna = excluirColuna;
    conciliacao.conciliar = conciliar;
    conciliacao.conciliarValorData = conciliarValorData
    conciliacao.linhaExtratoClick = linhaExtratoClick;
    conciliacao.linhaArquivoClick = linhaArquivoClick;
    conciliacao.conciliado = false;
    conciliacao.limparJaConciliados = limparJaConciliados;
    conciliacao.saldoExtrato = 0.00;
    conciliacao.saldoArquivo = 0.00;
    conciliacao.imprimirResultados = imprimirResultados;

    let indicesConciliadosExtrato = [];
    let indicesConciliadosArquivo = [];
    
    function imprimirResultados(print){
      window.print();
    };
    
    function linhaExtratoClick(indice){
        let valorIndice = arrumarValorParaComparacao(conciliacao.extrato[indice][2]);
        
        let tabelaExtrato = document.getElementById("tableExtrato");
        if(tabelaExtrato.rows[indice+1].cells[2].className === "marcador"){
            tabelaExtrato.rows[indice+1].cells[2].className = '';
            indicesConciliadosExtrato.splice(indice-1,1);
            
            conciliacao.saldoExtrato = conciliacao.saldoExtrato - valorIndice;
        }
        else{
            tabelaExtrato.rows[indice+1].cells[2].className = "marcador";
            indicesConciliadosExtrato.push(indice);
            conciliacao.saldoExtrato = conciliacao.saldoExtrato + valorIndice;
            
        }
        conciliacao.saldoExtrato = parseFloat(parseFloat(conciliacao.saldoExtrato).toFixed(2));
    }
      
    function linhaArquivoClick(indice){
        let valorIndice = arrumarValorParaComparacao(conciliacao.arquivo[indice][2]);
        
        let tabelaArquivo = document.getElementById("tableArquivo");
        if(tabelaArquivo.rows[indice+1].cells[2].className === "marcador"){
            tabelaArquivo.rows[indice+1].cells[2].className = '';
            indicesConciliadosArquivo.splice(indice-1,1);
            conciliacao.saldoArquivo = conciliacao.saldoArquivo - valorIndice;
        }
        else{
            tabelaArquivo.rows[indice+1].cells[2].className = "marcador";
            indicesConciliadosArquivo.push(indice);
            conciliacao.saldoArquivo = conciliacao.saldoArquivo + valorIndice;
        }
        conciliacao.saldoArquivo = parseFloat(parseFloat(conciliacao.saldoArquivo).toFixed(2));
    }
      
    function excluirColuna (indice,tipo){
        if  (tipo==='E')
        {
            excluirColunaExtrato(indice);
        }
        else
        {
           excluirColunaRazao(indice);
        }
    }

    function excluirColunaExtrato(indice){
        conciliacao.cabecalhoExtrato.splice(indice,1);

        conciliacao.extrato = conciliacao.extrato.filter(function (value, index, arr){
            return value.splice(indice,1);
        });    
    }

    function excluirColunaRazao(indice){
        conciliacao.cabecalhoArquivo.splice(indice,1);

        conciliacao.arquivo = conciliacao.arquivo.filter(function (value, index, arr){
            return value.splice(indice,1);
        });
    }

    function limparJaConciliados(){
        limparRazaoConciliado();
        limparExtratoConciliado();
        removeMarcadores();
        zerarSaldos();
    }

    function limparRazaoConciliado(){
        indicesConciliadosArquivo.sort(function(a,b){ return b - a; });

        indicesConciliadosArquivo.forEach(function(element) {
                conciliacao.arquivo.splice(element,1);
        });
        indicesConciliadosArquivo = []
    }


    function limparExtratoConciliado(){
        indicesConciliadosExtrato.sort(function(a,b){ return b - a; });

        
       indicesConciliadosExtrato.forEach(function(element) {
            conciliacao.extrato.splice(element,1);
        });
        
        indicesConciliadosExtrato = [];
    }

    function removeMarcadores(){
        $('#tableArquivo td').removeClass("marcador");
        $('#tableExtrato td').removeClass("marcador");
    }

    function zerarSaldos(){
        conciliacao.saldoExtrato = 0;
        conciliacao.saldoArquivo = 0;
    }

    function zeraControles(){
        conciliacao.conciliado = false;
    }

    function conciliar(){
        //1) Validar qtd colunas do extrato e do arquivo
        let copiaExtrato = conciliacao.extrato.slice(); 
        zeraControles();

        copiaExtrato.forEach(function(element,index) {
               let data = element[0];
               let historico = element[1];
               let valor = element[2];
            
               if (valor && localizarNoRazaoPorValor(valor)){
                  let tabelaExtrato = document.getElementById("tableExtrato");

                  if(tabelaExtrato.rows[index+1].cells[2]) 
                        tabelaExtrato.rows[index+1].cells[2].className = "marcador";
                
                indicesConciliadosExtrato.push(index);               
                conciliacao.saldoExtrato += arrumarValorParaComparacao(valor);
               
               }    
        });

        conciliacao.saldoExtrato = formatarValorParaMoeda(conciliacao.saldoExtrato);
        conciliacao.saldoArquivo = formatarValorParaMoeda(conciliacao.saldoArquivo);

        conciliacao.conciliado = true;
        
    }

     function conciliarValorData(){

        //1) Validar qtd colunas do extrato e do arquivo
        let copiaExtrato = conciliacao.extrato.slice(); 
        zeraControles();

        copiaExtrato.forEach(function(element,index) {
               let data = element[0];
               let historico = element[1];
               let valor = element[2];
            
               if (valor && localizarNoRazaoPorValorData(valor,data)){
                  let tabelaExtrato = document.getElementById("tableExtrato");

                  if(tabelaExtrato.rows[index+1].cells[2]){
                    tabelaExtrato.rows[index+1].cells[0].className = "marcador";
                    tabelaExtrato.rows[index+1].cells[2].className = "marcador";
                  }
                
                  indicesConciliadosExtrato.push(index);               
                  conciliacao.saldoExtrato += arrumarValorParaComparacao(valor);
               
               }    
        });

        conciliacao.saldoExtrato = conciliacao.saldoExtrato;
        conciliacao.saldoArquivo = conciliacao.saldoArquivo;

        conciliacao.conciliado = true;
        
    }

    function localizarNoRazaoPorValor(valorExtrato){
         let encontrou = false;
         
         let copiaArquivo = conciliacao.arquivo.slice();  

         copiaArquivo.every(function(element,index) {
               let data = element[0];
               let historico = element[1];
               let valor = element[2];              

               if (valor && arrumarValorParaComparacao(valorExtrato) === arrumarValorParaComparacao(valor)){
                 let tabelaArquivo = document.getElementById("tableArquivo");
                 if(tabelaArquivo.rows[index+1].cells[2])
                    tabelaArquivo.rows[index+1].cells[2].className = "marcador";
                 encontrou = true;
                 
                 indicesConciliadosArquivo.push(index);               
              
                 conciliacao.saldoArquivo += arrumarValorParaComparacao(valor);               

                 copiaArquivo.splice(index,1);

                 return false;
               }else{
                   return true;
               }
          });

         return encontrou;
    }

    function localizarNoRazaoPorValorData(valorExtrato,dataExtrato){

         let encontrou = false;
         
         let copiaArquivo = conciliacao.arquivo.slice();  

         copiaArquivo.every(function(element,index) {
               let data = element[0];
               let historico = element[1];
               let valor = element[2];

               if ((valor && arrumarValorParaComparacao(valorExtrato) === arrumarValorParaComparacao(valor)) && (data && arrumaDataParaComparacao(dataExtrato) === arrumaDataParaComparacao(data))) {
                 let tabelaArquivo = document.getElementById("tableArquivo");
                 if(tabelaArquivo.rows[index+1].cells[2]){
                    tabelaArquivo.rows[index+1].cells[2].className = "marcador";
                    tabelaArquivo.rows[index+1].cells[0].className = "marcador";
                  }
                 encontrou = true;
                 
                 indicesConciliadosArquivo.push(index);               
              
                 conciliacao.saldoArquivo += arrumarValorParaComparacao(valor);               

                 copiaArquivo.splice(index,1);

                 return false;
               }else{
                   return true;
               }
          });

         return encontrou;
    }

    function arrumarDados(lista){

      let data_linha_anterior;
      let mes_ano;
      let historico_linha;

      lista.forEach(function(linha){

          /* PROCEDIMENTO ESPECIFICO PARA O BANRISUL */
          if(linha[1]){

            historico_linha = linha[1];

            if(historico_linha.match(/MOVIMENTOS/)){
              let historico_linha_ano = historico_linha.substring(historico_linha.indexOf('/')+1,historico_linha.indexOf('/') + 5);
              let historico_linha_mes_extenso = historico_linha.substring(historico_linha.indexOf('/')-4,historico_linha.indexOf('/')).trim();              
              let historico_linha_mes_numero;
              switch (historico_linha_mes_extenso) {
                case 'JAN': historico_linha_mes_numero = '01';
                break;
                case 'FEV': historico_linha_mes_numero = '02';
                break;
                case 'MAR': historico_linha_mes_numero = '03';
                break;
                case 'ABR': historico_linha_mes_numero = '04';
                break;
                case 'MAI': historico_linha_mes_numero = '05';
                break;
                case 'JUN': historico_linha_mes_numero = '06';
                break;
                case 'JUL': historico_linha_mes_numero = '07';
                break;
                case 'AGO': historico_linha_mes_numero = '08';
                break;
                case 'SET': historico_linha_mes_numero = '09';
                break;
                case 'OUT': historico_linha_mes_numero = '10';
                break;
                case 'NOV': historico_linha_mes_numero = '11';
                break;
                case 'DEZ': historico_linha_mes_numero = '12';
                break;
              }
              mes_ano = historico_linha_mes_numero + '/' + historico_linha_ano;              
            }

          }

          
          //ATRIBUI VALOR DA DATA ANTERIOR EM CAMPOS VAZIOS
          if(linha[0] === ''){
            linha[0] = data_linha_anterior;
          }
          data_linha_anterior  = linha[0];

          //COMPLETA A DATA CASO POSSUA SOMENTE O DIA NO ARQUIVO
          if(!isNaN(linha[0].trim())){            
            linha[0] = linha[0].padStart(2,'0') + '/' + mes_ano;
          }      

      });

      //NAO SEI PORQUE, MAS ESTAVA ADICIONANDO UMA LINHA A MAIS NO FINAL DO ARRAY
      //RESOLVI GAMBIANDO DESSA FORMA
      lista.pop();

    }

    function arrumaDataParaComparacao(data){
      let dataNova = data;

      if(dataNova.length > 10){
        dataNova = dataNova.substr(0,10);
      }

      return dataNova;

    }

    function arrumarValorParaComparacao(valor) {
  
      let valorCorrigido;
      let sinal = '+';
      
      // RETIRA OS ESPAÇOS EM BRANCO
      valorCorrigido = valor.replace(' ','');
      
      // ADICIONA O SINAL DE NEGATIVO
      if(valorCorrigido.indexOf('D') >= 0 || valorCorrigido.indexOf('-') >= 0){
        sinal = '-';
      }

      //VERIFICAR COM UTILIZAR ESSA COMPARAÇÃO, POIS NO ARQUIVO DE TESTE O CAMPO D e C ESTAO EM OUTRA COLUNA
      sinal = '+';
      
      //ADICIONA O SINAL E RETIRA TUDO QUE NAO SEJA NUMERO, PONTO e VIRGULA
      valorCorrigido = sinal + valor.replace(/[^\d.,]+/g, '');
      
      //DEIXA O NUMERO SEMPRE COM DUAS CASAS DECIMAIS
      let decimal1 = valorCorrigido.substr(valorCorrigido.length-1, 1);
      let decimal2 = valorCorrigido.substr(valorCorrigido.length-2, 1);
      let separador = valorCorrigido.substr(valorCorrigido.length-3, 1);
      if (separador != '.' && separador != ',') {
        if (decimal2 === '.' || decimal2 === ',') {
          valorCorrigido = valorCorrigido + '0';
        } else {
          valorCorrigido = valorCorrigido + '.00';
        }
      }
      
      //DEIXA SOMENTE O SINAL E O NUMERO, SEM PONTO E VIRGULA
      valorCorrigido = valorCorrigido.replace(/[^\d+-]+/g, '');
      
      //FORMATA PARA NUMERO COM DUAS CASAS DECIMAIS COM PONTO
      valorCorrigido = valorCorrigido.substring(0,valorCorrigido.length-2) + '.' + valorCorrigido.substring(valorCorrigido.length-2,valorCorrigido.length);
      
      //TRANSFORMA PARA O FORMATO NUMERICO
      valorCorrigido = parseFloat(valorCorrigido) ;
      
      return valorCorrigido;
    } 

    function formatarValorParaMoeda(valor) {
      let valorFormatado = parseFloat(valor).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      return valorFormatado;
    }

    
    $(function()
    {

        function buildConfig(tipoArquivo)
        {
            return {
                delimiter: ";",
                encoding: 'ISO-8859-1',
                complete: tipoArquivo==='E'?completeFnExtrato:completeFnArquivo,
                error: errorFn
            };
        }

        function completeFnExtrato(results)
        {
            conciliacao.cabecalhoExtrato = results.data.shift();
            
            conciliacao.extrato = results.data;

            arrumarDados(conciliacao.extrato);
            
            $scope.$apply();
        }

        function completeFnArquivo(results)
        {

            conciliacao.cabecalhoArquivo = results.data.shift();
            conciliacao.arquivo = results.data;

            arrumarDados(conciliacao.arquivo);
            
            $scope.$apply();
        }

        function errorFn(err, file)
        {
            console.log("ERROR:", err, file);
        }   


        $('#carregar').click(function(){

            var config = buildConfig("E");

             removeMarcadores();
             

            $('#extrato').parse({
                config: config
            });

            config = buildConfig("A");
            $('#arquivo').parse({
                config: config
            });
            
            zerarSaldos();
        });

    });    

}]);
