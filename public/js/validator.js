function validateFile(file, fileRules, resultFile) {
    if (fileRules.mimes) {
        resultFile.mimes = {
            expected: fileRules.mimes,
            actual: file.type,
            isValid: fileRules.mimes.includes(file.type)
        };
    }

    if (fileRules.size) {
        if (fileRules.size.min) {
            resultFile.size.min = {
                expected: humanFileSize(fileRules.size.min),
                actual: humanFileSize(file.size),
                isValid: fileRules.size.min <= file.size
            };
        }
        if (fileRules.size.max) {
            resultFile.size.max = {
                expected: humanFileSize(fileRules.size.max),
                actual: humanFileSize(file.size),
                isValid: fileRules.size.max >= file.size
            };
        }
    }
    if (fileRules.name) {
        if (fileRules.name.min) {
            resultFile.name.min = {
                expected: fileRules.name.min,
                actual: file.name.length,
                isValid: fileRules.name.min <= file.name.length
            };
        }
        if (fileRules.name.max) {
            resultFile.name.max = {
                expected: fileRules.name.max,
                actual: file.name.length,
                isValid: fileRules.name.max >= file.name.length
            };
        }
    }

    return resultFile;
}

function validateImage(image, imageRules, resultimage) {
    if (imageRules.height) {
        if (imageRules.height.min) {
            resultimage.height.min = {
                expected: imageRules.height.min,
                actual: image.naturalHeight,
                isValid: imageRules.height.min <= image.naturalHeight
            };
        }
        if (imageRules.height.max) {
            resultimage.height.max = {
                expected: imageRules.height.max,
                actual: image.naturalHeight,
                isValid: imageRules.height.max >= image.naturalHeight
            };
        }
    }

    if (imageRules.width) {
        if (imageRules.width.min) {
            resultimage.width.min = {
                expected: imageRules.width.min,
                actual: image.naturalWidth,
                isValid: imageRules.width.min <= image.naturalWidth
            };
        }
        if (imageRules.width.max) {
            resultimage.width.max = {
                expected: imageRules.width.max,
                actual: image.naturalWidth,
                isValid: imageRules.width.max >= image.naturalWidth
            };
        }
    }

    return resultimage;
}

function validate(file, image, rules) {
    let validationResults = [];
    rules.forEach(rule => {
        const result = Object.assign({}, rule);
        if (rule.file) {
            result.file = validateFile(file, rule.file, result.file);
        }

        if (rule.image) {
            result.image = validateImage(image, rule.image, result.image);
        }

        validationResults.push(result);
    });

    console.log(validationResults);

    return validationResults;
}