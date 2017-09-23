class Coordinate {
    constructor(x = 0, y = 0, z = 0){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class RGBA {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

class Perspective {
    constructor(id, near, far, angle, from, to){
        this.id = id;
        this.near = near;
        this.far = far;
        this.angle = angle;
        this.from = from;
        this.to = to;
    }
}

class Illumination {
    constructor(doublesided, local, ambient, background){
        this.doublesided = doublesided;
        this.local = local;
        this.ambient = ambient;
        this.background = background;
    }
}

//TODO: Modify Omni and Spot so they descend from a superclass
class Omni {
    constructor(id, enabled, location, ambient, diffuse, specular){
        this.id = id;
        this.enabled = enabled;
        this.location = location;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}

class Spot {
    constructor(id, enabled, angle, exponent, target, location, ambient, diffuse, specular){
        this.id = id;
        this.enabled = enabled;
        this.angle = angle;
        this.exponent = exponent;
        this.target = target;
        this.location = location;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}

class Texture {
    constructor(id, file, length_s, length_t){
        this.id = id;
        this.file = file;
        this.length_s = length_s;
        this.length_t = length_t;
    }
}

class Material {
    constructor(id, emission, ambient, diffuse, specular, shininess){
        this.id = id;
        this.emission = emission;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
    }
}

class Transformation {
    constructor(id, translate = null, rotate = [], scale = null){
        this.id = id;
        this.translate = translate;
        this.rotate = rotate;
        this.scale = scale;
    }
}

class Rotate {
    constructor(axis = 'x', angle = 0) {
        this.axis = axis;
        this.angle = angle;
    }
}

class Primitive {
    constructor(id){
        this.id = id;
    }
}

class Component {
    constructor(id, materials, texture, children, primitive){
        this.id = id;
        this.transformation = [];
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.primitive = primitive;
    }
}
