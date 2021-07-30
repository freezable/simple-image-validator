function getImageRow(file, image) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.appendChild(getImagePreviewColumn(image));
    row.appendChild(getFileInfoColumn(file, image));
    row.appendChild(getValidationColumn(file, image));

    return row;
}

function getImagePreviewColumn(image) {
    const div = document.createElement('div');
    div.classList.add('column');
    div.appendChild(image)

    return div;
}

function getValidationColumn(file, image) {
    const div = document.createElement('div');
    div.classList.add('column');

    validate(file, image, validationRules);

    return div;
}

function getFileInfoColumn(file, image) {
    const div = document.createElement('div');
    div.classList.add('column');
    div.appendChild(getInfoParagraph('File', file.name))
    div.appendChild(getInfoParagraph('Type', file.type))
    div.appendChild(getInfoParagraph('File size', humanFileSize(file.size)))
    div.appendChild(getInfoParagraph('Resolution', `${image.naturalWidth}x${image.naturalHeight}`))

    return div;
}

function getInfoParagraph(key, value) {
    const p = document.createElement('p');
    p.innerText = `${key}: ${value}`;

    return p;
}