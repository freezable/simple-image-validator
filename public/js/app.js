'use strict';

class ImageValidator {
    constraintsList = [];
    constructor(helper) {
        fetch('data/validation_rules.json')
            .then(response => response.json())
            .then(data => this.constraintsList = this._mapValidationRulesToConstrains(data))
            .catch(error => console.log(error));
        this.helper = helper
    }

    validateImage(image, callback, div) {
        this.constraintsList.forEach(imageConstraints => {
            validate.async(image, imageConstraints.constraints)
                .then(
                    attributes => {
                        callback(div, imageConstraints.name)
                    },
                    errors => {
                        if (errors instanceof Error) {
                            console.err("An error ocurred", errors);
                        } else {
                            callback(div, imageConstraints.name, errors)
                        }
                    });
        })
    }

    _mapValidationRulesToConstrains(validationRules) {
        let constraintsList = []
        validationRules.forEach(rule => {
            constraintsList.push({
                name: rule.name,
                constraints: this._mapRuleToConstrains(rule)
            });
        });

        return constraintsList;
    }

    _mapRuleToConstrains(rule) {
        let constraints = {};
        self = this;
        if (rule.file) {
            if (rule.file.mimes) {
                constraints.type = {
                    inclusion: {
                        within: rule.file.mimes,
                        message: function(value, attribute, validatorOptions, attributes, globalOptions) {
                            return validate.format("^'%{value}' file type is not included in allowed: %{types}", {
                                value: value,
                                types: validatorOptions.within.join(', ')
                            });
                        },
                    }
                };
            }
            if (rule.file.size) {
                constraints.size = { numericality: {} }
                if (rule.file.size.min) {
                    constraints.size.numericality.greaterThanOrEqualTo = rule.file.size.min;
                    constraints.size.numericality.notGreaterThanOrEqualTo = function(value, attribute, validatorOptions, attributes, globalOptions) {
                        return validate.format("^File size must be greater than or equal to %{size}", {
                            attribute: attribute,
                            size: self.helper.humanFileSize(validatorOptions.greaterThanOrEqualTo)
                        });
                    };
                }
                if (rule.file.size.max) {
                    constraints.size.numericality.lessThanOrEqualTo = rule.file.size.max;
                    constraints.size.numericality.notLessThanOrEqualTo = function(value, attribute, validatorOptions, attributes, globalOptions) {
                        return validate.format("^File size must be less than or equal to %{size}", {
                            attribute: attribute,
                            size: self.helper.humanFileSize(validatorOptions.lessThanOrEqualTo)
                        });
                    };
                }
            }
            if (rule.file.name) {
                constraints.name = { length: {} }
                if (rule.file.name.min) {
                    constraints.name.length.minimum = rule.file.name.min;
                }
                if (rule.file.name.max) {
                    constraints.name.length.maximum = rule.file.name.max;
                }
            }
        }
        if (rule.image) {
            if (rule.image.height) {
                constraints.height = { numericality: {} }
                if (rule.image.height.min) {
                    constraints.height.numericality.greaterThanOrEqualTo = rule.image.height.min;
                    constraints.height.numericality.notGreaterThanOrEqualTo = "must be greater than or equal to %{count} px."
                }
                if (rule.image.height.max) {
                    constraints.height.numericality.lessThanOrEqualTo = rule.image.height.max;
                    constraints.height.numericality.notLessThanOrEqualTo = "must be less than or equal to %{count} px."
                }
            }

            if (rule.image.width) {
                constraints.width = { numericality: {} }
                if (rule.image.width.min) {
                    constraints.width.numericality.greaterThanOrEqualTo = rule.image.width.min;
                    constraints.width.numericality.notGreaterThanOrEqualTo = "must be greater than or equal to %{count} px."
                }
                if (rule.image.width.max) {
                    constraints.width.numericality.lessThanOrEqualTo = rule.image.width.max;
                    constraints.width.numericality.notLessThanOrEqualTo = "must be less than or equal to %{count} px."
                }
            }
        }

        return constraints;
    }
}

class Helper {
    humanFileSize(bytes, si = false, dp = 2) {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(dp) + ' ' + units[u];
    }
}

class Renderer {
    constructor(helper, imageValidator) {
        this.helper = helper
        this.imageValidator = imageValidator
    }

    addImage(file, image, imagesBlockId) {
        const imagesBlock = document.getElementById(imagesBlockId);
        imagesBlock.appendChild(this._getImageRow(file, image));
        imagesBlock.appendChild(document.createElement('hr'));
    }

    _getImageRow(file, image) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.appendChild(this._getImagePreviewColumn(image));
        row.appendChild(this._getFileInfoColumn(file, image));
        row.appendChild(this._getValidationColumn(file, image));

        return row;
    }

    _getImagePreviewColumn(image) {
        const div = document.createElement('div');
        div.classList.add('column');
        div.appendChild(image)

        return div;
    }

    _getValidationColumn(file, image) {
        const div = document.createElement('div');
        div.classList.add('column');
        this.imageValidator.validateImage(
            this._mapImageFileData(file, image),
            this._addValidationResults,
            div
        );

        return div;
    }

    _addValidationResults(div, name, errors) {
        let p = document.createElement('p')
        let span = document.createElement('b')
        if (errors) {
            let ul = document.createElement('ul')
            for (let key in errors) {
                errors[key].forEach(message => {
                    let li = document.createElement('li')
                    li.innerText = message
                    ul.appendChild(li)
                })
            }
            span.innerText = name + ' - fail'
            span.classList.add('red');
            p.appendChild(span)
            p.appendChild(ul)
        } else {
            span.innerText = name + ' - success'
            span.classList.add('green');
            p.appendChild(span)
        }

        div.appendChild(p)
    }

    _mapImageFileData(file, image) {
        return {
            type: file.type,
            size: file.size,
            name: file.name,
            height: image.naturalHeight,
            width: image.naturalWidth,
        };
    }

    _getFileInfoColumn(file, image) {
        const div = document.createElement('div');
        div.classList.add('column');
        div.appendChild(this._getInfoParagraph('File', file.name))
        div.appendChild(this._getInfoParagraph('Type', file.type))
        div.appendChild(this._getInfoParagraph('File size', this.helper.humanFileSize(file.size)))
        div.appendChild(this._getInfoParagraph('Resolution', `${image.naturalWidth}x${image.naturalHeight} px`))

        return div;
    }

    _getInfoParagraph(key, value) {
        const p = document.createElement('p');
        p.innerText = `${key}: ${value}`;

        return p;
    }
}

class App {
    constructor(renderer, filesInputId, imagesBlockId) {
        this.renderer = renderer;
        this.filesInputId = filesInputId;
        this.imagesBlockId = imagesBlockId;
    }

    start() {
        const filesInput = document.getElementById(this.filesInputId);
        filesInput.addEventListener('change', e => {
            const files = Object.values(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = e => {
                    const image = new Image()
                    image.src = e.target.result
                    image.onload = () => {
                        renderer.addImage(file, image, this.imagesBlockId)
                    }
                }
            });
        })
    }
}

const helper = new Helper();
const imageValidator = new ImageValidator(helper)
const renderer = new Renderer(helper, imageValidator);
const app = new App(renderer, "files-input", "images");

document.addEventListener("DOMContentLoaded", function() {
    app.start();
});