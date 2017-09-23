
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
};

MySceneGraph.prototype.getBlock = function (rootElement, blockName) {
    var elems = rootElement.getElementsByTagName(blockName);
    if (elems == null) {
        this.onXMLError(blockName + " element is missing.");
        return null;
    }

    if (elems.length != 1) {
        this.onXMLError("either zero or more than one '" + blockName + "' element found.");
        return null;
    }

    return elems;
};

/**
 * Method that parses Scene block into workable info
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
 */

MySceneGraph.prototype.parseViews = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'views');

    if (elems == null) return null;

    var views = elems[0];
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

	//TODO: Default view

	this.logViews();
};

/**
 * Method that parses Illumination block into workable info
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
 */

MySceneGraph.prototype.parseLights = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'lights');

    if (elems == null) return null;

    var lights = elems[0];

    var omni = lights.getElementsByTagName('omni')[0];

    for (var i = 0; i < omni.length; i++) {
    		var omniLight = omni[i];

	}

    //TODO: finish Lights
};

/**
 * Method that parses Textures block into workable info
 */

MySceneGraph.prototype.parseTextures = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'textures');

    if (elems == null) return null;

    //TODO: finish Textures
};

/**
 * Method that parses Materials block into workable info
 */

MySceneGraph.prototype.parseMaterials = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'materials');

    if (elems == null) return null;

    //TODO: finish Materials
};

/**
 * Method that parses Transformations block into workable info
 */

MySceneGraph.prototype.parseTransformations = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'transformations');

    if (elems == null) return null;

    //TODO: finish Transformations
};

/**
 * Method that parses Primitives block into workable info
 */

MySceneGraph.prototype.parsePrimitives = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'primitives');

    if (elems == null) return null;

    //TODO: finish Primitives
};

/**
 * Method that parses Components block into workable info
 */

MySceneGraph.prototype.parseComponents = function (rootElement) {
    var elems = MySceneGraph.prototype.getBlock(rootElement, 'components');

    if (elems == null) return null;

    //TODO: finish Components
};

/*
 * Callback to be executed on any read error
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
 * Logging function
 *
 * @param axisLength
 */
MySceneGraph.prototype.logScene = function (axisLength) {
    console.log('<scene root="' + this.rootNodeID + '" axis_length="' + axisLength + '"/>');
};

MySceneGraph.prototype.logViews = function () {
	console.log()
};

/**
 * Logging function
 */
MySceneGraph.prototype.logIllumination = function () {
    console.log('<illumination doublesided="' + this.doublesided + '" local="' + this.local + '">\n' +
        '\t<ambient r="' + this.ambient.r + '" g="' + this.ambient.g + '" b="' + this.ambient.b + '" a="' + this.ambient.a + '"/>\n' +
        '\t<background r="' + this.background.r + '" g="' + this.background.g + '" b="' + this.background.b + '" a="' + this.background.a + '"/>\n' +
        '</illumination>');
};