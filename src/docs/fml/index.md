# FML Documentation

The Feature Modeling Language (FML) is used to represent how features are decomposed in sub-features and which kind of constraints are there between them.

The language comes with two syntaxes: flat (`.fml1`) and nested (`.fml2`).


## Flat syntax
### Syntax
To create a feature: `feature <id> <label>`  
To create a simple relation: `<fromId> <relationKind> <toId>`   
where `relationKind` is one of:
- `has`: required sub-feature
- `canHave`: optional sub-feature

To create a composite relation: `<fromId> <relationKind> [<toId1>, <toId2>, ...]`  
where `relationKind` is one of:
- `hasOneOf`: exclusive subfeatures, choose only 1
- `hasSome`: alternative subfeatures, chose at least 1

To add constraints: `<fromId> <contraintKind> <toId>`  
where `contraintKind` is one of:
- `requires`
- `excludes`


### Flat Syntax - Example
![Example Feature Model Diagram Flat](./examples/feature.fml1?src)

## Nested syntax
### Syntax
To create a feature: `<id> <label> <modifier>`  
where `modifier` is one of:
- `optional`
- `required`

This modifier is used when the feature is being defiend as sub-feature to specify the relation kind

Each feature declaration CAN be followed by one of the following relations:
- `has`: used in combination with the modifier of the features defined in this scope 
- `hasOneOf`: exclusive subfeatures, choose only 1
- `hasSome`: alternative subfeatures, chose at least 1.

AFTER the sub-features declaration (if present) we can define the constraints for the feature as `<contraintKind> <toId>`  
where `contraintKind` is one of:
- `requires`
- `excludes`

We can create a complex structure of features by nesting feature declarations, see examples for more in detail exaplanation.

### Examples
#### Simple feature with no sub-features
```fml2?src
id "Simple feature"
```
#### Feature with both required and optional sub-features
NOTE: both subfeatures are just simple feature declarations like in the previous example
```fml2?src
root "Root Feature"
  has
    req "Required sub-feature" required
    opt "Optional sub-feature" optional
```
#### Feature with constraint
NOTE: the contraints are not bi-directional, this only implies that if we want to select `opt1` we also have to select `op2`.
```fml2?src
root "Root Feature"
  has
    req "Required sub-feature" required
    opt1 "Optional sub-feature 1" optional
      requires opt2
    opt2 "Optional sub-feature 2" optional
```
If we want it bi-directional we have to use two constraints
```fml2?src
root "Root Feature"
  has
    req "Required sub-feature" required
    opt1 "Optional sub-feature 1" optional
      requires opt2
    opt2 "Optional sub-feature 2" optional
      requires opt1
```

### Nested Syntax - Example
![Example Feature Model Diagram Nested](./examples/feature.fml2?src)
