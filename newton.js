document.addEventListener("DOMContentLoaded", init, false); 

var canvas, ctx;
var _w, _h;

var r1, r2, r3;
var a, b, c;
var d, e;

var r1_up, r2_right, r3_up;

var res = 5;
var delt = 0.06;

function c_add(x, y)
{
    return new ComplexNumber(x.real + y.real, x.imaginary + y.imaginary);
}

function c_sub(x, y)
{
    return new ComplexNumber(x.real - y.real, x.imaginary - y.imaginary);
}

function c_mult(x, y)
{
    return new ComplexNumber(x.real * y.real - x.imaginary * y.imaginary, 
                             x.imaginary * y.real + x.real * y.imaginary);
}

function c_div(x, y)
{
    var denom = Math.pow(y.real, 2) + Math.pow(y.imaginary, 2);

    return new ComplexNumber(
        (x.real * y.real + x.imaginary * y.imaginary) / denom,
        (x.imaginary * y.real - x.real * y.imaginary) / denom);
}

function c_scal(x, s)
{
    return new ComplexNumber(x.real * s, x.imaginary * s);
}

function c_mod(x)
{
    return Math.sqrt(Math.pow(x.real, 2) + Math.pow(x.imaginary, 2));
}

function init()
{
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    _w = canvas.width;
    _h = canvas.height;
    r1 = new ComplexNumber(1, 0);
    r2 = new ComplexNumber(-0.5, 0.86603);
    r3 = new ComplexNumber(-0.5, -0.86603);
    r1_up = true;
    r2_right = true;
    r3_up = true;
    a = c_sub( c_sub( c_scal(r1, -1), r2 ), r3);
    b = c_add( c_add( c_mult(r1, r2), c_mult(r1, r3) ), c_mult(r2, r3));
    c = c_scal( c_mult( c_mult(r1, r2), r3) , -1);
    d = c_scal(a, 2);
    e = b;
    setInterval(draw, 16);
}

function eval_p(x)
{
    //have to use x.mult for complex #s
    //return(x.mult(x.mult(x)).add(x.mult(x.mult(a, 0))).add(x.mult(b, 0)).add(c, 0));
    return(c_add( 
           c_mult(x, c_mult(x, x)), c_add( 
           c_mult(a, c_mult(x, x)), c_add(
           c_mult(b, x), 
           c))));
}

function eval_dp(x)
{
    //return(x.mult(x.mult(3, 0)).add(x.mult(d)).add(e, 0));
    return(c_add(
           c_scal(c_mult(x, x), 3), c_add(
           c_mult(d, x),
           e)));
}

function find_close_h(z_1, count)
{
    var eps = 0.01;
    var z = new ComplexNumber(z_1.real, z_1.imaginary)
    if(count > 25)     
        return "black";     
    if(c_mod(c_sub(z, r1)) < eps)
        return "rgb(" + (255 - 10*count) + ", 0, 0)";
    if(c_mod(c_sub(z, r2)) < eps)
        return "rgb(0, " + (255 - 10*count) + ", 0)";
    if(c_mod(c_sub(z, r3)) < eps)
        return "rgb(0, 0, " + (255 - 10*count) + ")";
    return find_close_h(c_sub(z, c_div(eval_p(z), eval_dp(z))), count + 1); 
    //return find_close_h(z.sub(eval_p(z).div(eval_dp(z))), count + 1);
}

function find_close(z)
{
    return(find_close_h(z, 0));
}

function draw()
{
    ctx.clearRect(0, 0, _w, _h);
    var x, y;
    var x_r = 1.5; //complex plane range
    var y_r = 1.5;
    for(y = 0; y < _h; y += res)
    {
        for(x = 0; x < _w; x += res)
        {
            //x: x - (_w/2) / (_w/2)
            // x/_w/2 - 1
            // 2*x/_w - 1
            //y: _h/2 - y / (_h/2)
            // 1 - y/_h/2
            // 1 - 2*y/_h
            var z = new ComplexNumber(x_r * (2*x/_w - 1.0), y_r * (1.0 - 2*y/_h));
            //console.log(z.toString());
            ctx.fillStyle = find_close(z);
            ctx.fillRect(x, y, res, res);
        }
    }

    ctx.fillStyle = "black";
    ctx.fillRect((r1.real + x_r)*_w/(2*x_r), _h - (r1.imaginary + y_r)*_h/(2*y_r),
                  res, res);
    ctx.fillRect((r2.real + x_r)*_w/(2*x_r), _h - (r2.imaginary + y_r)*_h/(2*y_r),
                  res, res);
    ctx.fillRect((r3.real + x_r)*_w/(2*x_r), _h - (r3.imaginary + y_r)*_h/(2*y_r),
                  res, res);
    if(r1_up)
        r1.imaginary += delt;
    else r1.imaginary -= delt;
    if(r2_right)
        r2.real += 2*delt;
    else r2.real -= 2*delt;
    if(r3_up)
    {
        r3.real += delt;
        r3.imaginary += delt;
    }
    else
    {
        r3.real -= delt;
        r3.imaginary -= delt;
    }
    if(r1.imaginary >= y_r)
        r1_up = false;
    if(r1.imaginary <= -y_r)
        r1_up = true;
    if(r2.real >= x_r)
        r2_right = false;
    if(r2.real <= -x_r)
        r2_right = true;
    if(r3.real >= x_r || r3.imaginary >= y_r)
        r3_up = false;
    if(r3.real <= -x_r || r3.imaginary <= -y_r)
        r3_up = true;
    a = c_sub( c_sub( c_scal(r1, -1), r2 ), r3);
    b = c_add( c_add( c_mult(r1, r2), c_mult(r1, r3) ), c_mult(r2, r3));
    c = c_scal( c_mult( c_mult(r1, r2), r3) , -1);
    d = c_scal(a, 2);
    e = b;

}
    



