angular.module('conciliacaoApp', [])
  .controller('ConciliacaoController',['$scope', function($scope) {
    var conciliacao = this;
    
    conciliacao.excluirColuna = excluirColuna;
    conciliacao.conciliar = conciliar;
    conciliacao.conciliado = false;
    conciliacao.limparJaConciliados = limparJaConciliados;
    conciliacao.saldoExtrato = 0;
    conciliacao.saldoArquivo = 0;

    let indicesConciliadosExtrato = [];
    let indicesConciliadosArquivo = [];
    

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
    }


    function limparExtratoConciliado(){
        indicesConciliadosExtrato.sort(function(a,b){ return b - a; });

        
       indicesConciliadosExtrato.forEach(function(element) {
            conciliacao.extrato.splice(element,1);
        });
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

               // console.log('extrato', valor);
                  conciliacao.saldoExtrato += Number.parseFloat(valor);
               // console.log('saldo extrato', conciliacao.saldoExtrato);
               }    
        });

        conciliacao.saldoExtrato = conciliacao.saldoExtrato.toFixed(2);
        conciliacao.saldoArquivo = conciliacao.saldoArquivo.toFixed(2);

        conciliacao.conciliado = true;
        
    }

    function localizarNoRazaoPorValor(valorExtrato){
         let encontrou = false;
         
         let copiaArquivo = conciliacao.arquivo.slice();  

         copiaArquivo.every(function(element,index) {
               let data = element[0];
               let historico = element[1];
               let valor = element[2];

               if (valor && valorExtrato === valor){
                 let tabelaArquivo = document.getElementById("tableArquivo");
                 if(tabelaArquivo.rows[index+1].cells[2])
                    tabelaArquivo.rows[index+1].cells[2].className = "marcador";
                 encontrou = true;
                 
                 indicesConciliadosArquivo.push(index);
                
              //   console.log('Arquivo' + valor);
                 conciliacao.saldoArquivo += Number.parseFloat(valor);
               //  console.log('saldo arquivo', conciliacao.saldoArquivo);

                 copiaArquivo.splice(index,1);

                 return false;
               }else{
                   return true;
               }
          });

         return encontrou;
    }
    
    $(function()
    {

        function buildConfig(tipoArquivo)
        {
            return {
                delimiter: ",",
                encoding: 'ISO-8859-1',
                complete: tipoArquivo==='E'?completeFnExtrato:completeFnArquivo,
                error: errorFn
            };
        }

        function completeFnExtrato(results)
        {
            conciliacao.cabecalhoExtrato = results.data.shift();
            
            conciliacao.extrato = results.data;
            
            $scope.$apply();
        }

        function completeFnArquivo(results)
        {

            conciliacao.cabecalhoArquivo = results.data.shift();
            conciliacao.arquivo = results.data;
            
            $scope.$apply();
        }

        function errorFn(err, file)
        {
            console.log("ERROR:", err, file);
        }


        $('#carregar').click(function()
	    {

            var config = buildConfig("E");

             removeMarcadores();
             

            $('#extrato').parse({
                config: config
            });

            config = buildConfig("A");
            $('#arquivo').parse({
                config: config
            });

        });

    });    

}]);
