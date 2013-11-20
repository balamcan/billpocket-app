jQuery.support.cors = true;
var objeto = {
    compactado: false,
    tipo_activo: '',
    json: {
        venta: {},
        devolucion: {}
    },
    cambiarCompactado: function(compact) {
        this.compactado = compact;
        return this;
    },
    activarTipo: function(tipo) {
        this.tipo_activo = tipo;
        return this;
    },
    obtenerVenta: function(fn) {
        console.log('Venta');
        this.peticion('venta', fn);
        return this;
    },
    obtenerDevolucion: function(fn) {
        console.log('Devolucion');
        this.peticion('devolucion', fn);
        return this;
    },
    peticion: function(tipo, fn) {
        var obj = {};
        var jqxhr = {};
        $.ajaxSetup({cache: false});
        jqxhr = $.getJSON('https://www.billpocket.com/webappfake/index.php/test/get_test', 'tipotransaccion=' + tipo,
                function(data) {
                    $.extend(true, obj, data.transacciones);
                    $.ajaxSetup({cache: true});
                });
        this.json[tipo.toString()] = obj;
        if (fn && (typeof fn == "function")) {
            jqxhr.complete(fn);
        }
        return this;
    },
    mostrarJson: function(tipo) {
        console.log(this.json[tipo.toString()]);
        return this;
    },
    mostrarPeticion: function(tipo) {
        var html = '';
        var arreglo = this.json[tipo.toString()];
        for (var i in arreglo) {
            var icono_dispersion = '';
            var tarjeta = arreglo[i].t2m;
            tarjeta = tarjeta.split("=");

            if (arreglo[i].dispersion === "0") {
                icono_dispersion = '<span class="glyphicon glyphicon-time"></span>';
            } else if (arreglo[i].dispersion === "1") {
                icono_dispersion = '<span class="glyphicon glyphicon-ok"></span>';
            }
            html += '<tr>';
            html += '<td>' + arreglo[i].idtransaccion + '</td>';
            html += '<td>' + arreglo[i].fechahora + '</td>';
            html += '<td>' + arreglo[i].tipotarjeta + ' ' + tarjeta[0] + '</td>'; //arreglo[i].t2m  //+arreglo[i].tipotarjeta 
            html += '<td>$' + arreglo[i].monto + '</td>';
            html += '<td>' + icono_dispersion + '</td>';//arreglo[i].dispersion
            html += '<td>' + arreglo[i].etiqueta + '</td>';
            html += '</tr>';
        }
        $('#resultado>tbody').html(html);
        if (this.compactado) {
            compactar(this.compactado);
        }
        return this;
    },
    mostrarEncontrados: function(encontrados) {
        var html = '';
        var arreglo = this.json[objeto.tipo_activo.toString()];
        for (var i in encontrados) {
            var resultado = encontrados[i].toString();
            var icono_dispersion = '';
            var tarjeta = arreglo[resultado].t2m;
            tarjeta = tarjeta.split("=");

            if (arreglo[resultado].dispersion === "0") {
                icono_dispersion = '<span class="glyphicon glyphicon-time"></span>';
            } else if (arreglo[resultado].dispersion === "1") {
                icono_dispersion = '<span class="glyphicon glyphicon-ok"></span>';
            }
            html += '<tr>';
            html += '<td>' + arreglo[resultado].idtransaccion + '</td>';
            html += '<td>' + arreglo[resultado].fechahora + '</td>';
            html += '<td>' + arreglo[resultado].tipotarjeta + ' ' + tarjeta[0] + '</td>'; //arreglo[resultado].t2m  //+arreglo[resultado].tipotarjeta 
            html += '<td>$' + arreglo[resultado].monto + '</td>';
            html += '<td>' + icono_dispersion + '</td>';//arreglo[resultado].dispersion
            html += '<td>' + arreglo[resultado].etiqueta + '</td>';
            html += '</tr>';
        }
        $('#resultado>tbody').html(html);
        if (this.compactado) {
            compactar(this.compactado);
        }
        return this;
    }
};
$(document).ready(function() {
    objeto.obtenerVenta(function() {
        $('#img-loader').fadeOut();
        $('#resultado').removeClass('hidden');
        $('#btn-venta')[0].click();
    }).mostrarJson('venta');
    objeto.obtenerDevolucion().mostrarJson('devolucion');
    $('#form-search').submit(function(event) {
        event.preventDefault();
    });
});
$('#user,#password').keyup(function() {
    enabling();
});
$("#signin-form").submit(function(event) {
    event.preventDefault();
    if ($("#user").val() === "billpocket" && $("#password").val() === "123") {
        window.location.href = 'transactions.html';
        return;
    }
    $('.alert-danger').removeClass('hidden');
    $('#password').val('');
});


$('#btn-venta').click(function() {
    $('#nav-activities li').removeClass('active');
    $(this).parent().addClass('active');
    objeto.mostrarPeticion('venta').activarTipo('venta');
    ocultarMensaje();
});
$('#btn-devolucion').click(function() {
    $('#nav-activities li').removeClass('active');
    $(this).parent().addClass('active');
    objeto.mostrarPeticion('devolucion').activarTipo('devolucion');
    ocultarMensaje();
});
/*
 *object.keys regresa un arreglo de las claves del objeto mencionado en el parametro
 *array.some checa el valor del arreglo conforme a la funcion 
 */
$('#clear-search').click(function() {
    $('#search').val('');
    $(this).addClass('hidden');
    objeto.mostrarPeticion(objeto.tipo_activo);
    ocultarMensaje();
});
$('#search').keyup(function() {
    if ($(this).val() === '') {
        $('#clear-search').addClass('hidden');
    } else {
        $('#clear-search').removeClass('hidden');
    }
});
$('#btn-search').click(function() {
    if (objeto.tipo_activo !== '') {
        var valor = $('#search').val();
        ocultarMensaje();
        if (valor !== '') {
            var arreglo = objeto.json[objeto.tipo_activo.toString()];
            var encontrados = [];
            encontrados = filterValuePart(arreglo, valor);
            if (encontrados.length !== 0) {
                objeto.mostrarEncontrados(encontrados);
            } else {
                console.log('No encontrado');
                $('#no-results').removeClass('hidden');
            }
        } else {
            objeto.mostrarPeticion(objeto.tipo_activo);
        }
    }
});
$('#btn-compact').on('click', function() {
    if ($(this).hasClass('active')) {
        compactar(objeto.cambiarCompactado(false).compactado);
        $(this).find('span').addClass('glyphicon-unchecked').removeClass('glyphicon-check');
    } else {
        compactar(objeto.cambiarCompactado(true).compactado);
        $(this).find('span').addClass('glyphicon-check').removeClass('glyphicon-unchecked');
    }
    ocultarMensaje();
});
function compactar(bool) {
    if (!bool) {
        var table = $('#resultado tr>th, #resultado tr>td');
        table.removeClass('hidden');
    } else {
        var table = $('#resultado tr>th:not(:nth-child(2),:nth-child(3),:nth-child(4)), #resultado tr>td:not(:nth-child(2),:nth-child(3),:nth-child(4))');
        table.addClass('hidden');
    }
}
function filterValuePart(arr, val) {
    var list = [];
    var re = new RegExp(val.toString());
    for (var i in arr) {
        for (var j in arr[i]) {
            if (arr[i][j] !== null) {
                if (arr[i][j].toString().match(re)) {
                    list.push(i);
                }
            }
        }
    }
    return list;
}
function ocultarMensaje() {
    var obj = $('#no-results');
    if (!obj.hasClass('hidden')) {
        obj.addClass('hidden');
    }
}
function enabling() {
    if ($('#user').val() !== "" && $('#password').val() !== "") {
        $('#enviar').removeClass('disabled');
    } else {
        $('#enviar').addClass('disabled');
    }
}