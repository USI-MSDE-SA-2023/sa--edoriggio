# MSDE Software Architecture 2022

Modeling Assignment Repository

## Getting started

```
brew install yarn plantuml
yarn install
yarn global add onchange
```

For installation of brew take a look at:

* https://brew.sh/

Make sure that your `java` version is compatible with `plantuml`

## Building the document 

```
yarn build
```

The document [Markdown](https://www.markdownguide.org/cheat-sheetplan) and [PlantUML](https://plantuml.com/) source is found in the `src/sa/model/` folder.

Write your assignments extending the template `index.md` as you solve each exercise.

Enter your project title and your name in the header.

```
---
title: 
Model of My Project
---
author:
Enter Your Full Name
---
```

The HTML output and the generated SVG diagrams are stored in the `upload` folder.

## Clean the Output
```
yarn clean
```

## Continuous Build
```
yarn watch
```

This requires `yarn global add onchange` to work. It will automatically rebuild the documentation when the source files are modified. Stop it using `^C`.


## Submitting Your Work

After adding (with `git add`) whatever file you have modified (please **do not** include the generated files inside the `upload` folder), use the following commit message to indicate your work is ready to be checked:

```
git commit -m "exercise N complete, please check"
git push
```

where N is the assignment number (0-15).

We will use github issues to provide feedback about your model. 

Also, be ready to present and discuss your work during lectures.



