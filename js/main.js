jQuery.support.cors = true;
var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
var dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
var objeto = {
    compactado: false,
    tipo_activo: '',
    json: {
        venta: {},
        devolucion: {}
    },
    mes_total: {
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
            var fechahora = arreglo[i].fechahora;
            tarjeta = tarjeta.split("=");
            fechahora = fechahora.replace(' ', 'T');
            ;
            fechahora = new Date(fechahora);
            if (arreglo[i].dispersion === "0") {
                icono_dispersion = '<span class="glyphicon glyphicon-time yellowText"></span>';
            } else if (arreglo[i].dispersion === "1") {
                icono_dispersion = '<span class="glyphicon glyphicon-ok greenText"></span>';
            }
            html += '<tr>';
            html += '<td>' + arreglo[i].idtransaccion + '</td>';
            html += '<td>' + dias[fechahora.getDay()].substr(0, 3) + '&nbsp;' + fechahora.getDate() + '-' + meses[fechahora.getMonth()].substr(0, 3) + '-' + fechahora.getFullYear() + '&nbsp;' + fechahora.toLocaleTimeString() + '</td>';
            html += '<td><img src="img/' + arreglo[i].tipotarjeta.toLowerCase() + '.jpg"> ' + tarjeta[0] + '</td>'; //arreglo[i].t2m  //+arreglo[i].tipotarjeta 
            html += '<td>$' + arreglo[i].monto + '</td>';
            html += '<td>' + icono_dispersion + '</td>';//arreglo[i].dispersion
            html += '<td>' + arreglo[i].etiqueta + '</td>';
            html += '</tr>';
        }
        $('#resultado>tbody').html(html);
//        if (this.compactado) {
//            compactar(this.compactado);
//        }
        return this;
    },
    mostrarEncontrados: function(encontrados) {
        var html = '';
        var arreglo = this.json[objeto.tipo_activo.toString()];
        for (var i in encontrados) {
            var resultado = encontrados[i].toString();
            var icono_dispersion = '';
            var tarjeta = arreglo[resultado].t2m;
            var fechahora = arreglo[resultado].fechahora;
            tarjeta = tarjeta.split("=");
            fechahora = fechahora.replace(' ', 'T');
            fechahora = new Date(fechahora);
            if (arreglo[i].dispersion === "0") {
                icono_dispersion = '<span class="glyphicon glyphicon-time yellowText"></span>';
            } else if (arreglo[i].dispersion === "1") {
                icono_dispersion = '<span class="glyphicon glyphicon-ok greenText"></span>';
            }
            html += '<tr>';
            html += '<td>' + arreglo[resultado].idtransaccion + '</td>';
            html += '<td>' + dias[fechahora.getDay()].substr(0, 3) + '&nbsp;' + fechahora.getDate() + '-' + meses[fechahora.getMonth()].substr(0, 3) + '-' + fechahora.getFullYear() + '&nbsp;' + fechahora.toLocaleTimeString() + '</td>';
            html += '<td><img src="img/' + arreglo[resultado].tipotarjeta.toLowerCase() + '.jpg"> ' + tarjeta[0] + '</td>'; //arreglo[i].t2m  //+arreglo[i].tipotarjeta 
            html += '<td>$' + arreglo[resultado].monto + '</td>';
            html += '<td>' + icono_dispersion + '</td>';//arreglo[resultado].dispersion
            html += '<td>' + arreglo[resultado].etiqueta + '</td>';
            html += '</tr>';
        }
        $('#resultado>tbody').html(html);
//        if (this.compactado) {
//            compactar(this.compactado);
//        }
        return this;
    },
    resumenMensual: function() {
        var datos = this.json[this.tipo_activo];
        var tabla = {};
        for (i in datos) {
            var fecha = datos[i].fechahora;
            var total = 0;
            fecha = fecha.replace(' ', 'T');
            fecha = new Date(fecha);
            if (tabla[fecha.getMonth().toString()] !== undefined) {
                tabla[fecha.getMonth().toString()] = parseFloat(datos[i].monto) + parseFloat(tabla[fecha.getMonth().toString()]);
            } else {
                tabla[fecha.getMonth().toString()] = parseFloat(datos[i].monto);
            }
        }

        this.mes_total[this.tipo_activo] = tabla;
        return this;
    },
    mostrarResumen: function() {
        var html = '';
        var tabla = this.mes_total[this.tipo_activo];
        for (i in tabla) {
            html += '<tr><td>' + meses[i] + '</td><td>$' + tabla[i] + '</td></tr>';
        }
        $('#resumen-mensual>tbody').html(html);
        return this;
    }
};

$(document).ready(function() {
    objeto.obtenerVenta(function() {
        $('#img-loader').fadeOut();
        $('#resultado').removeClass('hidden');
        $('#btn-venta')[0].click();
        $('#mostar-resumen').removeClass('hidden');
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
    ocultarResumen();

});
$('#btn-devolucion').click(function() {
    $('#nav-activities li').removeClass('active');
    $(this).parent().addClass('active');
    objeto.mostrarPeticion('devolucion').activarTipo('devolucion');
    ocultarMensaje();
    ocultarResumen();
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
//$('#btn-compact').on('click', function() {
//    if ($(this).hasClass('active')) {
//        compactar(objeto.cambiarCompactado(false).compactado);
//        $(this).find('span').addClass('glyphicon-unchecked').removeClass('glyphicon-check');
//    } else {
//        compactar(objeto.cambiarCompactado(true).compactado);
//        $(this).find('span').addClass('glyphicon-check').removeClass('glyphicon-unchecked');
//    }
//    ocultarMensaje();
//});
//function compactar(bool) {
//    if (!bool) {
//        var table = $('#resultado tr>th, #resultado tr>td');
//        table.removeClass('hidden');
//    } else {
//        var table = $('#resultado tr>th:not(:nth-child(2),:nth-child(3),:nth-child(4)), #resultado tr>td:not(:nth-child(2),:nth-child(3),:nth-child(4))');
//        table.addClass('hidden');
//    }
//}
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
function ocultarResumen() {
    if ($('#mostar-resumen').find('i').hasClass('glyphicon-chevron-right')) {
        $('#mostar-resumen').find('i').addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-right');
        $('#resumen').addClass('hidden');
    }
    if (!$('#resumen').hasClass('hidden')) {
        $('#resumen').addClass('hidden');
    }
}
function enabling() {
    if ($('#user').val() !== "" && $('#password').val() !== "") {
        $('#enviar').removeClass('disabled');
    } else {
        $('#enviar').addClass('disabled');
    }
}
function grafica(resumen) {
    var data = [];
    for (i in resumen) {
        var obj = {
            label: meses[i].toString(),
            data: resumen[i]
        };
        data.push(obj);
    }
    $.plot('#grafica', data, {
        series: {
            pie: {
                show: true
            }
        }
    });
}
$('#mostar-resumen').click(function() {
    if ($(this).find('i').hasClass('glyphicon-chevron-down')) {
        $(this).find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
        $('#resumen').removeClass('hidden');
        objeto.resumenMensual().mostrarResumen();
        grafica(objeto.mes_total[objeto.tipo_activo]);
    } else {
        $(this).find('i').addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-right');
        $('#resumen').addClass('hidden');
    }
});