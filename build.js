const { PerformanceObserver, performance } = require('perf_hooks');
let t_start = performance.now();

process.on('exit', function () {
    let t_end = performance.now();
    console.log("Done in " + (t_end - t_start) + "ms");
});

const fs = require('fs-extra');
const glob = require('glob-fs')({ gitignore: true });
const marked = require('marked');
const marked_toc = require('marked');
const plantuml = require('plantuml');
const _ = require('lodash');
const slugify = require('uslug');
const { transformFml } = require('./fmlTransformer')


const fml_syntax_highlight = require('./fml_syntax_highlight');

const child_process = require('child_process');


function run(cmd, cwd, done) {

    console.log(cmd);

    const exec = child_process.exec;
    exec(cmd, { cwd }, (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err);
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            if (typeof done == "function") {
                done(err, stdout, stderr);
            } else { }
        }
    });

}


const build_json = fs.readJSONSync('build.json', { throws: false }) || {};

build_json.doc_build = (build_json.doc_build || 0) + 1;

fs.outputJsonSync('build.json', build_json, { spaces: 2 });


String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const cache_json = fs.readJSONSync('./upload/puml_cache.json', { throws: false }) || {};


function cache_lookup(text, miss) {
    let hash = new String(text).hashCode();

    if (cache_json[hash]) { //hit
        return new Promise((resolve, reject) => resolve(cache_json[hash]));
    } else {
        return miss(text).then((output) => {
            cache_json[hash] = output;
            fs.outputJson('./upload/puml_cache.json', cache_json, { spaces: 2 });
            return output;
        })
    }
}


let puml_count = 0;
let epuml_count = 0;
let fml_count = 0;


function toc(str) {

    // var defaultTemplate = '<%= depth %><%= bullet %>[<%= heading %>](#<%= url %>)\n';
    var defaultTemplate = '<a class="d<%=d%>" href="#<%= url %>"><%- heading %></a>\n';

    const utils = {};

    utils.arrayify = function (arr) {
        return !Array.isArray(arr) ? [arr] : arr;
    };

    utils.escapeRegex = function (re) {
        return re.replace(/(\[|\]|\(|\)|\/|\.|\^|\$|\*|\+|\?)/g, '\\$1');
    };

    utils.isDest = function (dest) {
        return !dest || dest === 'undefined' || typeof dest === 'object';
    };

    utils.isMatch = function (keys, str) {
        keys = utils.arrayify(keys);
        keys = (keys.length > 0) ? keys.join('|') : '.*';

        // Escape certain characters, like '[', '('
        var k = utils.escapeRegex(String(keys));

        // Build up the regex to use for replacement patterns
        var re = new RegExp('(?:' + k + ')', 'g');
        if (String(str).match(re)) {
            return true;
        } else {
            return false;
        }
    };

    utils.sanitize = function (src) {
        src = src.replace(/(\s*\[!|(?:\[.+ →\]\()).+/g, '');
        src = src.replace(/\s*\*\s*\[\].+/g, '');
        return src;
    };

    utils.slugify = function (str) {
        str = str.replace(/\/\//g, '-');
        str = str.replace(/\//g, '-');
        str = str.replace(/\./g, '-');
        str = _.str.slugify(str);
        str = str.replace(/^-/, '');
        str = str.replace(/-$/, '');
        return str;
    };

    var omit = ['grunt', 'helper', 'handlebars-helper', 'mixin', 'filter', 'assemble-contrib', 'assemble'];

    utils.strip = function (name, options) {
        var opts = _.extend({}, options);
        if (opts.omit === false) { omit = []; }
        var exclusions = _.union(omit, utils.arrayify(opts.strip || []));
        var re = new RegExp('^(?:' + exclusions.join('|') + ')[-_]?', 'g');
        return name.replace(re, '');
    };

    var opts = {
        firsth1: false,
        blacklist: true,
        omit: [],
        maxDepth: 3,
        slugifyOptions: { allowedChars: '-' },
        slugify: function (text) {
            return slugify(text, opts.slugifyOptions).replace("ex-", "ex---");
        }
    };

    var toc = '';
    var tokens = marked.lexer(str);
    var tocArray = [];

    // Remove the very first h1, true by default
    if (opts.firsth1 === false) {
        tokens.shift();
    }

    // Do any h1's still exist?
    var h1 = _.some(tokens, { depth: 1 });

    var task_count = 0;

    tokens.filter(function (token) {
        // Filter out everything but headings
        if (token.type !== 'heading' || token.type === 'code') {
            return false;
        }

        // Since we removed the first h1, we'll check to see if other h1's
        // exist. If none exist, then we unindent the rest of the TOC
        if (!h1) {
            token.depth = token.depth - 1;
        }

        // Store original text and create an id for linking
        token.heading = opts.strip ? utils.strip(token.text, opts) : token.text;

        if (token.heading.indexOf("Ex -") >= 0) {
            token.heading = token.heading.replace("Ex -", `<span class='task'>${task_count}.</span> `);
            task_count++;
        }

        // Create a "slugified" id for linking
        token.id = opts.slugify(token.text);

        // Omit headings with these strings
        var omissions = ['Table of Contents', 'TOC', 'TABLE OF CONTENTS'];
        var omit = _.union([], opts.omit, omissions);

        if (utils.isMatch(omit, token.heading)) {
            return;
        }

        return true;
    }).forEach(function (h) {

        if (h.depth > opts.maxDepth) {
            return;
        }

        var bullet = Array.isArray(opts.bullet)
            ? opts.bullet[(h.depth - 1) % opts.bullet.length]
            : opts.bullet;

        var data = _.extend({}, opts.data, {
            d: h.depth,
            depth: new Array((h.depth - 1) * 2 + 1).join(' '),
            bullet: bullet ? bullet : '* ',
            heading: h.heading,
            url: h.id
        });

        tocArray.push(data);
        toc += ejs.render(defaultTemplate, data);
        //toc += _.template(opts.template || defaultTemplate, data);
    });

    return {
        data: tocArray,
        toc: opts.strip
            ? utils.strip(toc, opts)
            : toc
    };
}



const renderer = new marked.Renderer();

renderer._paragraph = renderer.paragraph;

renderer.paragraph = function (text) {

    //console.log(text);

    if (text.trim().startsWith("{")) {

        renderer.sec_depth = renderer.sec_depth || 0;
        renderer.sec_depth++;

        let c = text.split(".");
        c.shift();

        if (c.length > 0) {
            return `<section class="${c.join(" ")}">`;
        } else {
            return "<section>"
        }
    }

    if (text.trim().startsWith("}")) {

        renderer.sec_depth = renderer.sec_depth || 0;
        renderer.sec_depth--;

        return "</section>"
    }

    if (text.trim().startsWith("Pass: ") && renderer.sec_depth > 0) {
        return `<section class="pass"><span>&starf;&star;&star;: </span>${text.split("Pass: ")[1]}</section>`;
    }
    if (text.trim().startsWith("Good: ") && renderer.sec_depth > 0) {
        return `<section class="ok"><span>&starf;&starf;&star;: </span>${text.split("Good: ")[1]}</section>`;
    }
    if (text.trim().startsWith("Exceed: ") && renderer.sec_depth > 0) {
        return `<section class="exceed"><span>&starf;&starf;&starf;: </span>${text.split("Exceed: ")[1]}</section>`;
    }
    if (text.trim().startsWith("Hint: ") && renderer.sec_depth > 0) {
        return `<section class="hint"><span>Hint: </span>${text.split("Hint: ")[1]}</section>`;
    }

    return renderer._paragraph(text);
}

renderer._code = renderer.code;

renderer.code = function (code, infostring, escaped) {
    // console.log(code, infostring, escaped);
    if (infostring) {
        if (infostring.startsWith("puml")) {
            let i = epuml_count++;
            cache_lookup(code, () => plantuml(code)).then(svg => {
                fs.writeFile(renderer._out_folder + "puml_e" + i + ".svg", svg)
            })
            return `<img src="./puml_e${i}.svg">`;
        }

        if (infostring.startsWith("fml1") || infostring.startsWith("fml2")) {

            let fml = "" + code;

            let i = fml_count++;

            const fml_output = renderer._out_folder + "fml_" + i + ".svg";
            const tempFile = renderer._out_folder + `fml_${i}.temp.fml`;
            
            try{
                fs.ensureFileSync(tempFile);
        
                const transformedFml = transformFml(code, infostring.startsWith("fml1") ? "Flat" : "Nested")

                fs.writeFile(tempFile, transformedFml)
                .then(_ => {
                    run("node fml " + tempFile + " " + fml_output, undefined, () => {
                        fs.remove(tempFile)
                    })
                })

                if (infostring.indexOf("?src") >= 0) {

                    return `<aside class="flex"><pre><code>${highlight_fml(fml)}</code></pre><img src="./fml_${i}.svg"></aside>`;

                } else {
                
                    return `<img src="./fml_${i}.svg">`;

                }

            } catch(e) {
                //the original code will be printed (opportunity to show the error)
                console.log(e);
            }
        
        }

    }
    return renderer._code(code, infostring, escaped);

};

//TODO (["'])(?:(?=(\\?))\2.)*?\1 for quoted strings (which do not contain keywords)
function highlight_fml(s) {
    return fml_syntax_highlight.parse(s);
    let keywords = ["feature", "optional", "required", "hasOneOf", "hasSome", "has", "requires", "excludes"] //fml1

    return keywords.reduce((s, k) => s.replace(new RegExp(k+" ", "g"), `<b>${k}</b> `, s)
                                      .replace(new RegExp(k+"\n", "g"), `<b>${k}</b>\n`, s)
                                      .replace(new RegExp(k, "g"), `<b>${k}</b>`), s);
}

renderer._image = renderer.image;

renderer.image = function (href, title, text) {

    //console.log(href, title, text);

    let url = new URL(href, "http://localhost/");

    href = "." + url.pathname;

    if (href.endsWith(".puml")) {

        let i = puml_count++;

        fs.readFile(href.replace("./", renderer._in_folder)).then(puml => {
            return cache_lookup(puml, () => plantuml(puml))
            //return plantuml(puml)
        }).then(svg => {
            fs.writeFile(renderer._out_folder + "puml_" + i + ".svg", svg)
        })

        return `<img src="./puml_${i}.svg" alt="${text}">`;

    }

    if (href.endsWith(".fml1") || href.endsWith(".fml2")) {

        let i = fml_count++;

        const fml_output = renderer._out_folder + "fml_" + i + ".svg";
        const tempFile = renderer._out_folder + `fml_${i}.temp.fml`;
            
        fs.ensureFileSync(tempFile);

        let fml = fs.readFileSync(href.replace("./", renderer._in_folder), 'utf8');

        const transformedFml = transformFml(fml, href.endsWith(".fml1") ? "Flat" : "Nested")

        fs.writeFile(tempFile, transformedFml)
            .then(_ => {
                run("node fml " + tempFile + " " + fml_output, undefined, () => {
                    fs.remove(tempFile)
                })
            })

        if (url.searchParams.has("src")) {

            return `<aside class="flex"><pre><code>${highlight_fml(fml)}</code></pre><img src="./fml_${i}.svg" alt="${text}"></aside>`;

        } else {
        
            return `<img src="./fml_${i}.svg" alt="${text}">`;

        }
    }

    if (href.endsWith(".fml") || href.endsWith(".fml0")) {

        let i = fml_count++;

        const fml_output = renderer._out_folder + "fml_" + i + ".svg";

        run("node fml " + href.replace("./", renderer._in_folder) + " " + fml_output);

        return `<img src="./fml_${i}.svg" alt="${text}">`;

    }

    if (href.endsWith(".c5")) {

        let i = fml_count++;

        const fml_output = renderer._out_folder + "c5_" + i + ".svg";

        run("node c5 " + href.replace("./", renderer._in_folder) + " " + fml_output);

        return `<img src="./c5_${i}.svg" alt="${text}">`;

    }

    if (href.endsWith(".madr") || href.endsWith(".md")) {

        let md = fs.readFileSync(href.replace("./", renderer._in_folder));

        return `<h3>${text}</h3>` + marked.parse("" + new String(md));

    }

    if (href.endsWith(".svg") || href.endsWith(".png") ) {
        let fileName = href.split("/").slice(-1);
        let out = renderer._out_folder + `${fileName}`;
        fs.copySync(href.replace("./", renderer._in_folder), out);

        return `<img src="${fileName}" alt="${text}">`;
    }

    return renderer._image(href, title, text);

}

renderer._heading = renderer.heading;

let task_count = 0;

renderer.heading = function (text, level, raw, slugger) {

    // console.log(text);

    if (text.indexOf("Ex -") >= 0) {
        text = text.replace("Ex -", `<span class='task'>${task_count}.</span> `);
        task_count++;
    }

    // let sec = "<section>"

    // if (task_count > 1) {
    //     sec = "</section>" + sec;
    // }

    return renderer._heading(text, level, raw, slugger);
};


marked.setOptions({
    renderer, //: new marked.Renderer(),
    highlight: function (code) {
        return code; //require('highlight').highlightAuto(code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
});

function loadMD(f, vars = {}) {

    let txt = "" + new String(fs.readFileSync(f));

    if (txt.indexOf("---") >= 0) {

        let parts = txt.split("\n---\n");

        parts.slice(0, -1).forEach(p => {
            let lines = p.split("\n");
            let k = lines[0].split(":");
            vars[k[0]] = lines.slice(1).join("\n");
        });

        txt = parts[parts.length - 1];

    }

    //convert strings to booleans
    Object.keys(vars).forEach(k => {
        if (vars[k] === "false") vars[k] = false;
        if (vars[k] === "true") vars[k] = true;
    })

    console.log(vars);

    task_count = 0;

    return { md: marked.parse(txt), meta: vars, toc: toc(txt) };
}


let ejs = require('ejs');

let views = {}

function render_one(model, out_file, template) {

    model.out_file = out_file;

    views[template] = views[template] || new String(fs.readFileSync("./template/" + template + ".ejs"));

    let html = ejs.render(views[template], model);

    fs.ensureFileSync(out_file);
    fs.writeFileSync(out_file, html);

};


var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push({ name: file, stat });
                    next();
                }
            });
        })();
    });
};



function deltaBuild() {
    let old_file_list = {};
    try {
        old_file_list = fs.readJsonSync('upload/files.json');
    } catch (e) { }

    walk("src", function (err, list) {

        if (list === undefined) {
            console.log("Missing src folder")
            return;
        }

        if (list.length == 0) {
            console.log("Empty src folder")
            return;
        }

        let flat = {};
        list.filter((f) => !f.name.endsWith(".DS_Store")).forEach(f => {
            flat[f.name] = f.stat;
        });

        let todo = {};

        let deleted = {};
        Object.keys(old_file_list).forEach(k => { deleted[k] = old_file_list[k] });

        let changed = [];

        function extract_dir(k) {
            let a = k.split("/")
            return a.slice(1, 3).join("/");
        }

        function push(k) {
            let d = extract_dir(k);
            todo[d] = (todo[d] || 0) + 1;

            changed.push(k);
        }

        Object.keys(flat).forEach((k) => {
            if (old_file_list[k]) {
                if (flat[k].mtimeMs != old_file_list[k].mtimeMs) {
                    push(k);
                }
                delete deleted[k]; //k was found so what's left over should have been deleted
            } else {
                push(k); //this is a new addition
            }
        });

        fs.writeJson("upload/files.json", flat);

        console.log('Changed', changed);
        console.log('Deleted', Object.keys(deleted));

        if (Object.keys(todo).length == 0) {
            todo['sa/model'] = 1;
        }

        //todo['exercises/8-ws'] = 1;

        if (Object.keys(todo).indexOf('templates/doc.ejs') != -1) {
            todo = Array.from(new Set(Object.keys(flat).map(extract_dir))).reduce((a, c) => { a[c] = 1; return a; }, {});
            delete todo['templates/doc.ejs'];
        }

        Object.keys(todo).filter(k => k.endsWith('meta.json')).forEach(mk => {
            delete todo[mk];
            Array.from(new Set(Object.keys(flat).map(extract_dir))).filter(k => k.startsWith(mk.split("/")[0])).forEach(k => {
                todo[k] = 1;
            })
        })

        console.log("Building", todo);

        Object.keys(todo).forEach(buildDoc.bind(null, changed, Object.keys(deleted)));

    })
}

function buildDoc(changed, deleted, slide) {

    console.log("Building " + slide);

    let md_path = "./src/" + slide + "/index.md";

    let md = { meta: {} };

    let meta_path = "./src/" + slide.split("/")[0] + "/meta.json";
    try {
        md.meta = fs.readJSONSync(meta_path);
    } catch (e) {
        //console.log(e);
    }

    md.meta.build = build_json.doc_build;
    //md.meta.lecture = "Web Atelier 2020 ";
    md.meta.timestamp = new Date().toLocaleString();

    if (fs.existsSync(md_path) && fs.lstatSync(md_path).isFile()) {

        renderer._out_folder = `./upload/${slide}/`;
        renderer._in_folder = `./src/${slide}/`;

        md = loadMD(md_path, md.meta);

        md.meta.series = "";

        let model = { title: slide, md: md.md, toc: md.toc, meta: md.meta, pid: slide + "." + build_json.build }

        let mdout = `./upload/${slide}/index.html`;

        render_one(model, mdout, 'doc');

    }

}

fs.ensureDirSync("upload/");
deltaBuild();