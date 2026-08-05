import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function RichTextEditor({ value, onChange }) {
    const editorRef = useRef(null);

    return (
        <div className="w-full">
            <Editor
                apiKey="pj4rz8mt29me7gl6imcon1t7ddb0cos5xgw6aw3582zvxd7a"
                onInit={(evt, editor) => editorRef.current = editor}
                value={value}
                onEditorChange={onChange}
                init={{
                    height: 500,
                    menubar: true,
                    branding: false,
                    promotion: false,
                    statusbar: true,
                    resize: true,
                    elementpath: false,
                
                    // Content styling
                    content_style: `
                        body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        font-size: 14px;
                        line-height: 1.6;
                        padding: 20px;
                        color: #333;
                        }
                        h1, h2, h3, h4, h5, h6 {
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                        font-weight: 600;
                        line-height: 1.3;
                        }
                        h1 { font-size: 2em; }
                        h2 { font-size: 1.5em; }
                        h3 { font-size: 1.25em; }
                        p { margin-bottom: 1em; }
                        a { color: #0066cc; text-decoration: underline; }
                        img { max-width: 100%; height: auto; }
                        blockquote {
                        border-left: 4px solid #ddd;
                        padding-left: 1em;
                        margin-left: 0;
                        color: #666;
                        font-style: italic;
                        }
                        code {
                        background: #f4f4f4;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-family: 'Courier New', monospace;
                        }
                        pre {
                        background: #f4f4f4;
                        padding: 12px;
                        border-radius: 4px;
                        overflow-x: auto;
                        }
                        table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1em 0;
                        }
                        table td, table th {
                        border: 1px solid #ddd;
                        padding: 8px;
                        }
                        table th {
                        background-color: #f4f4f4;
                        font-weight: bold;
                        }
                    `,
                    
                    // Plugins
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount',
                        'emoticons', 'codesample', 'quickbars'
                    ],
                    
                    // Toolbar configuration
                    toolbar: [
                        'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor',
                        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table',
                        'removeformat code fullscreen help'
                    ].join(' | '),
                    
                    // Menu bar
                    menubar: 'file edit view insert format tools table help',
                    
                    // Quick toolbar on selection
                    quickbars_selection_toolbar: 'bold italic underline | blocks | quicklink blockquote',
                    quickbars_insert_toolbar: false,
                    
                    // Format options
                    block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
                    
                    // Font options
                    font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
                    
                    // Image upload settings
                    images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
                        // You can implement custom image upload here
                        // For now, convert to base64
                        const reader = new FileReader();
                        reader.readAsDataURL(blobInfo.blob());
                        reader.onloadend = () => {
                        resolve(reader.result);
                        };
                        reader.onerror = () => {
                        reject('Image upload failed');
                        };
                    }),
                    
                    // Auto-resize
                    autoresize_bottom_margin: 50,
                    autoresize_overflow_padding: 50,
                    
                    // Link settings
                    link_default_target: '_blank',
                    link_assume_external_targets: true,
                    link_title: false,
                    
                    // Table settings
                    table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                    table_appearance_options: true,
                    table_default_attributes: {
                        border: '1'
                    },
                    table_default_styles: {
                        'border-collapse': 'collapse',
                        'width': '100%'
                    },
                    
                    // Paste settings
                    paste_as_text: false,
                    paste_data_images: true,
                    smart_paste: true,
                    
                    // Advanced settings
                    relative_urls: false,
                    remove_script_host: false,
                    convert_urls: true,
                    
                    // Accessibility
                    accessibility_focus: true,
                    
                    // Prevent automatic paragraph wrapping
                    forced_root_block: 'p',
                    
                    // Valid elements (security)
                    valid_elements: '*[*]',
                    extended_valid_elements: '*[*]',
                    
                    // Custom styles
                    content_css: false,
                }}
            />
        </div>
    );
}