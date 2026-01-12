document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('csvInput').addEventListener('input', handleCsvInput);
document.getElementById('charSeparator').addEventListener('change', handleCsvInput);
document.getElementById('valuesInput').addEventListener('input', handleValuesInput);
document.getElementById('updateCsvButton').addEventListener('click', updateCsvInput);

let imageSlices = [];
let valueMap = {};
let cellSize;  // Dimensione delle celle predefinita

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const grid = document.getElementById('imageGrid');
                grid.innerHTML = '';
                const width = img.width;
                const height = img.height;
                cellSize = Math.floor(height);  // Calcola la dimensione delle celle solo in base all'altezza dell'immagine
                const cols = Math.floor(width / cellSize);

                imageSlices = [];

                for (let x = 0; x < cols; x++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = cellSize;
                    canvas.height = cellSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, x * cellSize, 0, cellSize, cellSize, 0, 0, cellSize, cellSize);
                    imageSlices.push({
                        url: canvas.toDataURL(),
                        contrastColor: getContrastColor(canvas)
                    });

                    const imageCell = document.createElement('span');
                    imageCell.classList.add('cell');
                    imageCell.style.backgroundImage = `url(${canvas.toDataURL()})`;
                    imageCell.style.width = `${cellSize}px`;
                    imageCell.style.height = `${cellSize}px`;
                    grid.appendChild(imageCell);

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.dataset.index = imageSlices.length - 1;
                    input.addEventListener('input', handleValueInput);
                    grid.appendChild(input);
                }
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function handleValueInput(event) {
    const index = event.target.dataset.index;
    const value = event.target.value;
    valueMap[value] = imageSlices[index];
}

function handleValuesInput(event) {
    const values = event.target.value.split(',');
    document.querySelectorAll('#imageGrid input').forEach((input, index) => {
        input.value = values[index] ? values[index].trim() : '';
        handleValueInput({ target: input });
    });
}

function handleCsvInput(event) {
    const csv = document.getElementById('csvInput').value;
    const useCharSeparator = document.getElementById('charSeparator').checked;
    const rows = csv.split('\n');
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    const table = document.createElement('table');

    rows.forEach((row) => {
        const tr = document.createElement('tr');
        const cells = useCharSeparator ? row.split('') : row.split(',');
        cells.forEach((cell) => {
            const td = document.createElement('td');
            td.style.width = `${cellSize+2}px`;
            td.style.height = `${cellSize}px`;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = cell;
            input.addEventListener('input', (e) => {
                const cellValue = e.target.value;
                if (valueMap[cellValue]) {
                    td.style.backgroundImage = `url(${valueMap[cellValue].url})`;
                    td.style.backgroundSize = 'cover';
                    input.style.color = valueMap[cellValue].contrastColor;
                } else {
                    td.style.backgroundImage = 'none';
                }
            });
            td.appendChild(input);
            if (valueMap[cell]) {
                td.style.backgroundImage = `url(${valueMap[cell].url})`;
                td.style.backgroundSize = 'cover';
                input.style.color = valueMap[cell].contrastColor;
            }
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    tableContainer.appendChild(table);
}

function getContrastColor(canvas) {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000' : '#FFF';
}

function updateCsvInput() {
    const rows = [];
    document.querySelectorAll('#tableContainer tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('td input').forEach(input => {
            cells.push(input.value);
        });
        rows.push(cells.join(document.getElementById('charSeparator').checked ? '' : ','));
    });
    document.getElementById('csvInput').value = rows.join('\n');
}
