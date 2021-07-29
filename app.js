const fileInput = document.getElementById("file");
const imagesBlock = document.getElementById("images");

fileInput.addEventListener('change', e => {
    const files = Object.values(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            const image = new Image()
            image.src = e.target.result
            image.onload = () => {
                image.id = file.name;
                const div = document.createElement('div');
                addFilleInfo(div, file, image)
                div.appendChild(image)
                imagesBlock.appendChild(div);
                imagesBlock.appendChild(document.createElement('hr'));
            }
        }
    });
})

function addFilleInfo(div, file, image) {
    div.appendChild(createInfoParagraph('File', file.name))
    div.appendChild(createInfoParagraph('Type', file.type))
    div.appendChild(createInfoParagraph('File size', humanFileSize(file.size)))
    div.appendChild(createInfoParagraph('Resolution', `${image.naturalWidth}x${image.naturalHeight}`))

    return div;
}

function createInfoParagraph(key, value) {
    const p = document.createElement('p');
    p.innerText = `${key}: ${value}`;

    return p;
}


function humanFileSize(bytes, si = false, dp = 1) {
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