//#region window stuff
window.addEventListener('load', () => {
    create_storage();
    load_saved_files();
});

function reload_page(){
    window.location.reload();
}
//#endregion

//#region assigning events to elements
const modal_togglers = document.querySelectorAll('.dropdown-item');
for (const toggler of modal_togglers) {
    const modal_id = toggler.getAttribute('name');
    if (modal_id) {
        toggler.addEventListener('click', () => {
            event.preventDefault();
            const modal_element = document.getElementById(modal_id);
            const modal = new bootstrap.Modal(modal_element);
            modal.toggle();
        });
    }
}
//#endregion

//#region clipboard apis (https://deanmarktaylor.github.io/clipboard-test/)
function set_clipboard(text) {
    if (!navigator.clipboard) {
        fallback_set_clipboard(text);
        return;
    }
    navigator.clipboard.writeText(text);
    editor.focus();
}

function fallback_set_clipboard(text) {
    var text_area = document.createElement("textarea");
    text_area.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(text_area);
    text_area.focus();
    text_area.select();

    try {
        document.execCommand('copy');
    } catch (err) {
    }

    document.body.removeChild(text_area);
}
//#endregion

//#region storage api's
function add_file(name, content){
    const files = get_files();
    files.push({
        name: name,
        content: content
    })
    update_storage(files);
}

function update_file(name, new_content){
    const files = get_files();
    const index = files.findIndex((file) => file.name === name);
    files[index].content = new_content;
    update_storage(files);
}

function iterate_files(f){
    const files = get_files();
    files.forEach(f);
}

function get_files(){
    return JSON.parse(localStorage.getItem('files')).files;
}

function update_storage(files){
    const json = {
        files: files
    }
    localStorage.setItem('files', JSON.stringify(json));
}

function clear_storage(){
    localStorage.clear();
}

function create_storage(){
    if (is_storage_empty()){
        localStorage.setItem('files', JSON.stringify({files: []}));
    }
}

function is_storage_empty(){
    return !localStorage.getItem('files');
}
//#endregion

//#region modal functions
function close_modal(sender){
    const modal = bootstrap.Modal.getInstance(sender.closest('.modal'));
    modal.hide();
}
//#endregion

//#region editor variables
let last_selected_file_name = '';
let last_selected_file_content = '';
let editor;
//#endregion

//#region editor commands
function download_current_file(){
    const data = editor.getValue();
    const file_name = 'file.txt';
    const file = new Blob([data], {type: 'text/plain'});

    const a = document.createElement('a');
    const url = URL.createObjectURL(file);

    a.href = url;
    a.download = file_name;

    document.body.appendChild(a);

    a.click();
    
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function select_all(){
    editor.execCommand('selectAll');
    editor.focus();
}

function copy_all(){
    set_clipboard(editor.getValue());
    editor.focus();
}

function copy_selected(){
    set_clipboard(editor.getSelection());
    editor.focus();
}


function tab(){
    editor.execCommand('indentMore');
    editor.focus();
}

function undo(){
    editor.execCommand('undo');
    editor.focus();
}

function redo(){
    editor.execCommand('redo');
    editor.focus();
}
//#endregion

//#region file functions
function save_new_file(){
    const file_name = document.getElementById('new-file-text-input').value;
    const file_content = editor.getValue() ?? '';
    add_file(file_name, file_content);
}

function save_file(){
    update_file(last_selected_file_name, editor.getValue());
}

function open_selected_file(){
    create_editor(last_selected_file_content);
}

function create_editor(file_content){
    const textarea = document.getElementById('textarea');
    
    if (file_content){
        textarea.innerHTML = file_content;
    }
    else{
        textarea.innerHTML = '';
    }

    // remove previous editor if it exists
    const previous_editor = document.getElementsByClassName('CodeMirror')[0];
    if (previous_editor){
        previous_editor.remove();
    }

    editor = CodeMirror.fromTextArea(textarea, {
        mode: 'javascript',
        lineNumbers: true,
        theme: "dracula",
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        showTrailingSpace: true,
        indentUnit: 4,
        indentWithTabs: true,
        activeLine: true,
        tabSize: 4,
        scrollbarStyle: "simple",
        keymap: "sublime",
    });
}

// load saved files in the select file modal body
function load_saved_files(){
    const modal_body = document.getElementById('select-file-modal').children[0].children[0].children[1];
    iterate_files((file) => {
        // create file label
        const div = document.createElement('div');
        div.classList.add('form-check');

        const input = document.createElement('input');
        input.classList.add('form-check-input');
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'choose-file-form');
        input.id = generate_id();

        const label = document.createElement('label');
        label.classList.add('form-check-label');
        label.setAttribute('for', input.id);
        label.innerText = file.name;

        input.addEventListener('click', () => {
            last_selected_file_content = file.content;
            last_selected_file_name = file.name;
        });

        div.appendChild(input);
        div.appendChild(label);
        modal_body.appendChild(div);
    });
}
//#endregion 

//#region utilities
function generate_id(){
    const max = 15;
    const min = 5;

    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var lenght = Math.floor(Math.random() * (max - min + 1)) + min;
    var password = Array(lenght).fill(chars).map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    
    return password;
}
//#endregion




