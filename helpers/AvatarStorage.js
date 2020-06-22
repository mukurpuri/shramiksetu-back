// Load dependencies
import dotenvJSON from "dotenv-json";
dotenvJSON({
    path: "./.env.json"
});
// Load dependencies
import _  from 'lodash';
import fs  from 'fs';
import path  from 'path';
import Jimp  from 'jimp';
import crypto  from 'crypto';
import mkdirp  from 'mkdirp';
import concat  from 'concat-stream';
import streamifier  from 'streamifier';

// Configure UPLOAD_PATH
// process.env.AVATAR_STORAGE contains uploads/avatars
var UPLOAD_PATH = path.resolve(__dirname, '..', process.env.AVATAR_STORAGE);

var AvatarStorage = function(options) {

    function AvatarStorage(opts) {
        var baseUrl = process.env.AVATAR_BASE_URL;

        var allowedStorageSystems = ['local'];
        var allowedOutputFormats = ['jpg', 'png'];

        var defaultOptions = {
            storage: 'local',
            output: 'png',
            quality: 70,
            square: true,
            threshold: 500,
            responsive: false
        };

        var options = (opts && _.isObject(opts)) ? _.pick(opts, _.keys(defaultOptions)) : {};
        options = _.extend(defaultOptions, options);

        this.options = _.forIn(options, function(value, key, object) {
            switch (key) {

                case 'square':
                case 'responsive':
                object[key] = _.isBoolean(value) ? value : defaultOptions[key];
                break;

                case 'storage':
                value = String(value).toLowerCase();
                object[key] = _.includes(allowedStorageSystems, value) ? value : defaultOptions[key];
                break;

                case 'output':
                value = String(value).toLowerCase();
                object[key] = _.includes(allowedOutputFormats, value) ? value : defaultOptions[key];
                break;

                case 'quality':
                value = _.isFinite(value) ? value : Number(value);
                object[key] = (value && value >= 0 && value <= 100) ? value : defaultOptions[key];
                break;

                case 'threshold':
                value = _.isFinite(value) ? value : Number(value);
                object[key] = (value && value >= 0) ? value : defaultOptions[key];
                break;

            }
        });

        // set the upload path
        this.uploadPath = this.options.responsive ? path.join(UPLOAD_PATH, 'responsive') : UPLOAD_PATH;

        // set the upload base url
        this.uploadBaseUrl = this.options.responsive ? path.join(baseUrl, 'responsive') : baseUrl;

        if (this.options.storage == 'local') {
        // if upload path does not exist, create the upload path structure
        !fs.existsSync(this.uploadPath) && mkdirp.sync(this.uploadPath);
        }
    }

    AvatarStorage.prototype._generateRandomFilename = function() {
        
        var bytes = crypto.pseudoRandomBytes(32);
        var checksum = crypto.createHash('MD5').update(bytes).digest('hex');
        return checksum + '.' + this.options.output;
    };

    AvatarStorage.prototype._createOutputStream = function(filepath, cb) {
        
        var that = this;
        var output = fs.createWriteStream(filepath);
        output.on('error', cb);
        output.on('finish', function() {
            cb(null, {
                destination: that.uploadPath,
                baseUrl: that.uploadBaseUrl,
                filename: path.basename(filepath),
                storage: that.options.storage
            });
        });
        // return the output stream
        return output;
    };

    AvatarStorage.prototype._processImage = function(image, cb) {
        

        // create a reference for this to use in local functions
        var that = this;

        var batch = [];

        // the responsive sizes
        var sizes = ['lg', 'md', 'sm'];

        var filename = this._generateRandomFilename();

        var mime = Jimp.MIME_PNG;

        // create a clone of the Jimp image
        var clone = image.clone();

        // fetch the Jimp image dimensions
        var width = clone.bitmap.width;
        var height = clone.bitmap.height;
        var square = Math.min(width, height);
        var threshold = this.options.threshold;

        // resolve the Jimp output mime type
        switch (this.options.output) {
        case 'jpg':
        mime = Jimp.MIME_JPEG;
        break;
        case 'png':
        default:
        mime = Jimp.MIME_PNG;
        break;
        }

        // auto scale the image dimensions to fit the threshold requirement
        if (threshold && square > threshold) {
        clone = (square == width) ? clone.resize(threshold, Jimp.AUTO) : clone.resize(Jimp.AUTO, threshold);
        }

        // crop the image to a square if enabled
        if (this.options.square) {

        if (threshold) {
        square = Math.min(square, threshold);
        }

        // fetch the new image dimensions and crop
        clone = clone.crop((clone.bitmap.width - square) / 2, (clone.bitmap.height - square) / 2, square, square);
        }

        // set the image output quality
        clone = clone.quality(this.options.quality);

        if (this.options.responsive) {

        // map through the responsive sizes and push them to the batch
        batch = _.map(sizes, function(size) {

        var outputStream;

        var image = null;
        var filepath = filename.split('.');

        // create the complete filepath and create a writable stream for it
        filepath = filepath[0] + '_' + size + '.' + filepath[1];
        filepath = path.join(that.uploadPath, filepath);
        outputStream = that._createOutputStream(filepath, cb);

        // scale the image based on the size
        switch (size) {
        case 'sm':
        image = clone.clone().scale(0.3);
        break;
        case 'md':
        image = clone.clone().scale(0.7);
        break;
        case 'lg':
        image = clone.clone();
        break;
        }

        // return an object of the stream and the Jimp image
        return {
        stream: outputStream,
        image: image
        };
        });

        } else {

        // push an object of the writable stream and Jimp image to the batch
        batch.push({
        stream: that._createOutputStream(path.join(that.uploadPath, filename), cb),
        image: clone
        });

        }

        // process the batch sequence
        _.each(batch, function(current) {
        // get the buffer of the Jimp image using the output mime type
        current.image.getBuffer(mime, function(err, buffer) {
        if (that.options.storage == 'local') {
        // create a read stream from the buffer and pipe it to the output stream
        streamifier.createReadStream(buffer).pipe(current.stream);
        }
        });
        });
    }

    AvatarStorage.prototype._handleFile = function(req, file, cb) {
        //
        var that = this;
        var fileManipulate = concat(function(imageData) {
            
            Jimp.read(imageData)
                .then(function(image) {
                // process the Jimp image buffer
                that._processImage(image, cb);
            })
            .catch(function(err){
                
            });
        });

        // write the uploaded file buffer to the fileManipulate stream
        file.stream.pipe(fileManipulate);

    };

    AvatarStorage.prototype._removeFile = function(req, file, cb) {
        


        var matches, pathsplit;
        var filename = file.originalname;
        var _path = path.join(this.uploadPath, filename);
        var paths = [];

        delete file.filename;
        delete file.destination;
        delete file.baseUrl;
        delete file.storage;

        if (this.options.responsive) {
        pathsplit = _path.split('/');
        matches = pathsplit.pop().match(/^(.+?)_.+?\.(.+)$/i);

        if (matches) {
        paths = _.map(['lg', 'md', 'sm'], function(size) {
        return pathsplit.join('/') + '/' + (matches[1] + '_' + size + '.' + matches[2]);
        });
        }
        } else {
        paths = [_path];
        }

        
        _.each(paths, function(_path) {
            fs.unlink(_path, cb);
        });
    }
    
    return new AvatarStorage(options);
};

// export the storage engine
module.exports = AvatarStorage;