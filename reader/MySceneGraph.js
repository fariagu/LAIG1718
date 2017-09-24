
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseGraph(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};


MySceneGraph.prototype.parseGraph = function(rootElement) {

	this.parseScene(rootElement);
	this.parseViews(rootElement);
	this.parseIllumination(rootElement);
	this.parseLights(rootElement);
	this.parseTextures(rootElement);
	this.parseMaterials(rootElement);
};

MySceneGraph.prototype.getBlock = function (rootElement, blockName) {
    var elems = rootElement.getElementsByTagName(blockName);
    if (elems == null) {
        this.onXMLError(blockName + " element is missing.");
        return null;
    }

    if (elems.length != 1 && elems.parentNode == 'dsx') {
        this.onXMLError("either zero or more than one '" + blockName + "' element found.(" + elems.length + ")");
        return null;
    }

    return elems;
};

/**
 * Method that parses Scene block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parseScene = function (rootElement) {
	var elems = MySceneGraph.prototype.getBlock(rootElement, 'scene');

	if (elems == null) return null;

    var scene = elems[0];
	var axisLength = this.reader.getFloat(scene, 'axis_length', true);
	this.rootNodeID = this.reader.getString(scene, 'root', true);
	this.axis = new CGFaxis(this.scene, axisLength, 1);

	this.logScene(axisLength);
};

/**
 * Method that parses Views block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parseViews = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'views');

    if (elems == null) return null;

    var views = elems[0];
	this.default = this.reader.getString(views, 'default', true)
	var perspectives = views.getElementsByTagName('perspective');
	this.perspectives = [];

	for (var i = 0; i < perspectives.length; i++) {

		var id = this.reader.getString(perspectives[i], 'id', true);
		var near = this.reader.getFloat(perspectives[i], 'near', true);
		var far = this.reader.getFloat(perspectives[i], 'far', true);
		var angle = this.reader.getFloat(perspectives[i], 'angle', true);
		var from = this.parseCoordinate(perspectives[i].getElementsByTagName('from')[0], true);
		var to = this.parseCoordinate(perspectives[i].getElementsByTagName('to')[0], true);

		this.perspectives.push(new Perspective(id, near, far, angle, from, to));
	}

	this.logViews();
};

/**
 * Method that parses Illumination block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parseIllumination = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'illumination');

    if (elems == null) return null;

    var illumination = elems[0];
	var ambient = illumination.getElementsByTagName('ambient')[0];
	var background = illumination.getElementsByTagName('background')[0];

	this.doublesided = this.reader.getBoolean(illumination, 'doublesided', true);
	this.local = this.reader.getBoolean(illumination, 'local', true);
	this.ambient = this.parseRGBA(ambient, true);
	this.background = this.parseRGBA(background, true);

    this.logIllumination();
};

/**
 * Method that parses Lights block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parseLights = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'lights');

    if (elems == null) return null;

    var lights = elems[0];

    this.omnis = [];
    var omni = lights.getElementsByTagName('omni');

    for (var i = 0; i < omni.length; i++) {
    		var omniLight = omni[i];

    		var id = this.reader.getString(omniLight, 'id', true);
			var enabled = this.reader.getBoolean(omniLight, 'enabled', true);
			var location = this.parseCoordinate(omniLight.getElementsByTagName('location')[0], true);
			var w = this.reader.getFloat(omniLight.getElementsByTagName('location')[0], 'w', true);
			var ambient = this.parseRGBA(omniLight.getElementsByTagName('ambient')[0], true);
			var diffuse = this.parseRGBA(omniLight.getElementsByTagName('diffuse')[0], true);
			var specular = this.parseRGBA(omniLight.getElementsByTagName('specular')[0], true);

			this.omnis.push(new Omni(id, enabled, location, w, ambient, diffuse, specular));
	}

    this.spots = [];
    var spot = lights.getElementsByTagName('spot');

    for (i = 0; i < spot.length; i++) {
        var spotLight = spot[i];

		id = this.reader.getString(spotLight, 'id', true);
		enabled = this.reader.getBoolean(spotLight, 'enabled', true);
        var angle = this.reader.getFloat(spotLight, 'angle', true);
		var exponent = this.reader.getFloat(spotLight, 'exponent', true);
		var target = this.parseCoordinate(spotLight.getElementsByTagName('target')[0], true);
		location = this.parseCoordinate(spotLight.getElementsByTagName('location')[0], true);
		ambient = this.parseRGBA(spotLight.getElementsByTagName('ambient')[0], true);
		diffuse = this.parseRGBA(spotLight.getElementsByTagName('diffuse')[0], true);
		specular = this.parseRGBA(spotLight.getElementsByTagName('specular')[0], true);

        this.spots.push(new Spot(id, enabled, angle, exponent, target, location, ambient, diffuse, specular));
    }

    this.logLights();
};

/**
 * Method that parses Textures block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parseTextures = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'textures');

    if (elems == null) return null;

    var textureBlock = elems[0];
    this.textures = [];
	var textures = textureBlock.getElementsByTagName('texture');

	for (var i = 0; i < textures.length; i++) {
		var id = this.reader.getString(textures[i], 'id', true);
		var file = this.reader.getString(textures[i], 'file', true);
		var length_s = this.reader.getFloat(textures[i], 'length_s', true);
		var length_t = this.reader.getFloat(textures[i], 'length_t', true);

		var tmp = new CGFtexture(this.scene, file);
        tmp.id = id;
        tmp.length_s = length_s;
        tmp.length_t = length_t;

		this.textures.push(tmp);
	}

	this.logTextures();
};

/**
 * Method that parses Materials block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parseMaterials = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'materials');

    if (elems == null) return null;

    var materialsBlock = elems[0];
    this.materials = [];
    var materials = materialsBlock.getElementsByTagName('material');

    for (var i = 0; i < materials.length; i++) {
        var id = this.reader.getString(materials[i], 'id', true);
        var emission = this.parseRGBA(materials[i].getElementsByTagName('emission')[0], true);
        var ambient = this.parseRGBA(materials[i].getElementsByTagName('ambient')[0], true);
        var diffuse = this.parseRGBA(materials[i].getElementsByTagName('diffuse')[0], true);
        var specular = this.parseRGBA(materials[i].getElementsByTagName('specular')[0], true);
        var shininess = this.reader.getFloat(materials[i].getElementsByTagName('shininess')[0], 'value', true);

        var tmp = new Material(id, emission, ambient, diffuse, specular, shininess);

        this.materials.push(tmp);
    }

	this.logMaterials();
};

/**
 * Method that parses Transformations block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parseTransformations = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'transformations');

    if (elems == null) return null;

    //TODO: finish Transformations

	this.logTransformations();
};

/**
 * Method that parses Primitives block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parsePrimitives = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'primitives');

    if (elems == null) return null;

    //TODO: finish Primitives

	this.logPrimitives();
};

/**
 * Method that parses Components block into workable info
 *
 * @param rootElement
 * @returns {null}
 */
MySceneGraph.prototype.parseComponents = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'components');

    if (elems == null) return null;

    //TODO: finish Components

	this.logComponents();
};

/**
 * Callback to be executed on any read error
 *
 * @param message
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};

/**
 * Helper function
 *
 * @param element
 * @param required
 * @returns RGBA object
 */
MySceneGraph.prototype.parseRGBA = function (element, required) {
	var attributes = ['r', 'g', 'b', 'a'];
	var r = [];

	for (var i = 0; i < attributes.length; i++) {
		r[i] = this.reader.getFloat(element, attributes[i], required);
	}

	return new RGBA(r[0], r[1], r[2], r[3]);
};

/**
 * Helper function
 *
 * @param element
 * @param required
 * @returns Coordinate object
 */
MySceneGraph.prototype.parseCoordinate = function (element, required) {
    var attributes = ['x', 'y', 'z'];
    var r = [];

    for (var i = 0; i < attributes.length; i++) {
        r[i] = this.reader.getFloat(element, attributes[i], required);
    }

    return new Coordinate(r[0], r[1], r[2]);
};

/**
 *	Returns formatted string that displays RGBA info
 *
 * @param element
 * @returns {string}
 * @constructor
 */
MySceneGraph.prototype.RGBAToString = function (element) {
	return 'r="' + element.r + '" g="' + element.g + '" b="' + element.b + '" a="' + element.a + '"';
};

/**
 * 	Returns formatted string that displays Coordinate info
 *
 * @param element
 * @returns {string}
 * @constructor
 */
MySceneGraph.prototype.CoordinateToString = function (element) {
    return 'x="' + element.x + '" y="' + element.y + '" z="' + element.z + '"';
};

/**
 * Logging function
 *
 * @param axisLength
 */
MySceneGraph.prototype.logScene = function (axisLength) {
    console.log('<scene root="' + this.rootNodeID + '" axis_length="' + axisLength + '"/>');
};

/**
 * Logging function
 */
MySceneGraph.prototype.logViews = function () {
	var str = '<views default="' + this.default + '">\n';

	for (var i = 0; i < this.perspectives.length; i++) {
		str += '\t<perspective id="' + this.perspectives[i].id + '" near="' + this.perspectives[i].near + '" far="' + this.perspectives[i].far + '" angle="' + this.perspectives[i].angle + '">\n' +
			'\t\t<from ' + this.CoordinateToString(this.perspectives[i].from) + '/>\n' +
			'\t\t<to ' + this.CoordinateToString(this.perspectives[i].to) + '/>\n' +
			'\t</perspective>\n';
	}

	str += '</views>';

	console.log(str);
};

/**
 * Logging function
 */
MySceneGraph.prototype.logIllumination = function () {
    console.log('<illumination doublesided="' + this.doublesided + '" local="' + this.local + '">\n' +
        '\t<ambient '+ this.RGBAToString(this.ambient) + '/>\n' +
        '\t<background ' + this.RGBAToString(this.background) + '/>\n' +
        '</illumination>');
};

/**
 * Logging function
 */
MySceneGraph.prototype.logLights = function () {
    var str = '<lights>\n';

    for (var i = 0; i < this.omnis.length; i++) {
        str += '\t<omni id="' + this.omnis[i].id + '" enabled="' + this.omnis[i].enabled + '">\n' +
            '\t\t<location ' + this.CoordinateToString(this.omnis[i].location) + ' w="' + this.omnis[i].w + '"/>\n' +
            '\t\t<ambient ' + this.RGBAToString(this.omnis[i].ambient) + '/>\n' +
            '\t\t<diffuse ' + this.RGBAToString(this.omnis[i].diffuse) + '/>\n' +
            '\t\t<specular ' + this.RGBAToString(this.omnis[i].specular) + '/>\n' +
            '\t</omni>\n';
    }

    for (i = 0; i < this.spots.length; i++) {
        str += '\t<spot id="' + this.spots[i].id + '" enabled="' + this.spots[i].enabled + '" angle="' + this.spots[i].angle + '" exponent="' + this.spots[i].exponent + '">\n' +
            '\t\t<target ' + this.CoordinateToString(this.spots[i].target) + '/>\n' +
            '\t\t<location ' + this.CoordinateToString(this.spots[i].location) + '/>\n' +
            '\t\t<ambient ' + this.RGBAToString(this.spots[i].ambient) + '/>\n' +
            '\t\t<diffuse ' + this.RGBAToString(this.spots[i].diffuse) + '/>\n' +
            '\t\t<specular ' + this.RGBAToString(this.spots[i].specular) + '/>\n' +
            '\t</spot>\n';
    }

    str += '</lights>';

    console.log(str);
};

/**
 * Logging function
 */
MySceneGraph.prototype.logTextures = function () {
	var str = '<textures>\n';

	for (var i = 0; i < this.textures.length; i++) {
		str += '\t<texture id="' + this.textures[i].id + '" file="' + this.textures[i].file + '" length_s="' + this.textures[i].length_s + '" length_t="' + this.textures[i].length_t + '"/>\n';
	}

	str += '</textures>';

	console.log(str);
};

/**
 * Logging function
 */
MySceneGraph.prototype.logMaterials = function () {
	var str = '<materials>\n';

    for (var i = 0; i < this.materials.length; i++) {
        str += '\t<material id="' + this.materials[i].id + '">\n' +
			'\t\t<emission ' + this.RGBAToString(this.materials[i].emission) + '/>\n' +
			'\t\t<ambient ' + this.RGBAToString(this.materials[i].ambient) + '/>\n' +
			'\t\t<diffuse ' + this.RGBAToString(this.materials[i].diffuse) + '/>\n' +
			'\t\t<specular ' + this.RGBAToString(this.materials[i].specular) + '/>\n' +
			'\t\t<shininess value="' + this.materials[i].shininess + '"/>\n' +
			'\t</material>\n';

    }

	str += '</materials>';

	console.log(str);
};

/**
 * Logging function
 */
MySceneGraph.prototype.logTransformations = function () {
    var str = '<transformations>\n';

    //TODO: finish

    str += '</transformations>';

    console.log(str);
};

/**
 * Logging function
 */
MySceneGraph.prototype.logPrimitives = function () {
    var str = '<primitives>\n';

    //TODO: finish

    str += '</primitives>';

    console.log(str);
};

/**
 * Logging function
 */
MySceneGraph.prototype.logComponents = function () {
    var str = '<components>\n';

    //TODO: finish

    str += '</components>';

    console.log(str);
};