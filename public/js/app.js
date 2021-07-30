const filesInput = document.getElementById("files-input");
const imagesBlock = document.getElementById("images");
let validationRules = [];

fetch('data/validation_rules.json')
    .then(response => response.json())
    .then(data => validationRules = data)
    .catch(error => console.log(error));

filesInput.addEventListener('change', e => {
    const files = Object.values(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            const image = new Image()
            image.src = e.target.result
            image.onload = () => {
                image.id = file.name;
                imagesBlock.appendChild(getImageRow(file, image));
                imagesBlock.appendChild(document.createElement('hr'));
            }
        }
    });
})