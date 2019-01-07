angular.module('conciliacaoApp', [])
  .controller('ConciliacaoController',['$scope', function($scope) {
    var conciliacao = this;
    var start, end;
    var stepped = 0, rowCount = 0, errorCount = 0, firstError;
    
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


        

        function printStats(msg)
        {
            if (msg)
                console.log(msg);
            console.log("       Time:", (end-start || "(Unknown; your browser does not support the Performance API)"), "ms");
            console.log("  Row count:", rowCount);
            if (stepped)
                console.log("    Stepped:", stepped);
            console.log("     Errors:", errorCount);
            if (errorCount)
                console.log("First error:", firstError);
        }



        function completeFnExtrato(results)
        {
            end = $.now();

            if (results && results.errors)
            {
                if (results.errors)
                {
                    errorCount = results.errors.length;
                    firstError = results.errors[0];
                }
                if (results.data && results.data.length > 0)
                    rowCount = results.data.length;
            }

            printStats("Parse complete");
            console.log("    Results:", results);
            conciliacao.cabecalhoExtrato = results.data.shift();
            
            conciliacao.extrato = results.data;
            
            $scope.$apply();
        }

          function completeFnArquivo(results)
            {
                end = $.now();

                if (results && results.errors)
                {
                    if (results.errors)
                    {
                        errorCount = results.errors.length;
                        firstError = results.errors[0];
                    }
                    if (results.data && results.data.length > 0)
                        rowCount = results.data.length;
                }

                printStats("Parse complete");
                console.log("    Results:", results);

                conciliacao.cabecalhoArquivo = results.data.shift();
                conciliacao.arquivo = results.data;
                
                $scope.$apply();
            }

        function errorFn(err, file)
        {
            end = $.now()();
            console.log("ERROR:", err, file);
        }


        $('#submit').click(function()
	    {
            stepped = 0;
            rowCount = 0;
            errorCount = 0;
            firstError = undefined;

            var config = buildConfig("E");

            $('#extrato').parse({
                config: config,
                before: function(file, inputElem)
                {
                    start = $.now();
                    console.log("Parsing file...", file);
                },
                error: function(err, file)
                {
                    console.log("ERROR:", err, file);
                    firstError = firstError || err;
                    errorCount++;
                },
                complete: function()
                {
                    end = $.now();
                    printStats("Done with all files");
                }
            });

            config = buildConfig("A");
            $('#arquivo').parse({
                config: config,
                before: function(file, inputElem)
                {
                    start = $.now();
                    console.log("Parsing file...", file);
                },
                error: function(err, file)
                {
                    console.log("ERROR:", err, file);
                    firstError = firstError || err;
                    errorCount++;
                },
                complete: function()
                {
                    end = $.now();
                    printStats("Done with all files");
                }
            });



            


        });

    });    

}]);
