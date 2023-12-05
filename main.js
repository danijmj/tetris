const BLOCKSIZE = 10

class Tetrix {
    currentPieze = {}
    lWidth = 20
    lHeight = 50
    timeTetrix = 300
    currentInterval
    
    constructor (div) {
        this.layout = new Layout(div, this.lWidth, this.lHeight)
        // this.layout.draw()
        this.newPieze()
        this.eventKeyListen = document.addEventListener('keydown', this.detectMovement.bind(this), false)
    }

    newPieze() {
        this.currentPieze = new Pieze(this.lWidth, this.lHeight)
        this.layout.draw(this.currentPieze)
        this.down()
        // this.detectMovement()
    }

    down() {
        this.currentInterval = setInterval(() => {

            let newPos = Object.assign({}, this.currentPieze.actualPos)
            newPos.y += 1
            let resultCheck = this.layout.checkPunch(this.currentPieze.structure, newPos)
            if (resultCheck.isOK === true) {
                this.currentPieze.down()
                this.layout.draw(this.currentPieze)
            } else if(resultCheck.destroyPieze === true) {
                this.destroyPieze()
            }
        }, this.timeTetrix)
    }

    
    detectMovement(event) {
        let self = this
        let newPos = {}
        let resultCheck = {}
    
        // track last key pressed
        switch (event.key) {
            case "ArrowLeft":
                newPos = Object.assign({}, self.currentPieze.actualPos)
                newPos.x -= 1
                resultCheck = self.layout.checkPunch(self.currentPieze.structure, newPos)
                if (resultCheck.isOK === true) {
                    self.currentPieze.left()
                    self.layout.draw(self.currentPieze)
                }
                break;
            case "ArrowUp":

                self.currentPieze.turn()

                /* newPos = Object.assign({}, self.currentPieze.actualPos)
                newPos.x -= 1
                resultCheck = self.layout.checkPunch(self.currentPieze.structure, newPos)
                if (resultCheck.isOK === true) {
                    self.currentPieze.left()
                    self.layout.draw(self.currentPieze)
                }
                break; */
            case "ArrowRight":
                newPos = Object.assign({}, self.currentPieze.actualPos)
                newPos.x += 1
                resultCheck = self.layout.checkPunch(self.currentPieze.structure, newPos)
                if (resultCheck.isOK === true) {
                    self.currentPieze.right()
                    self.layout.draw(self.currentPieze)
                }
                
                break;
            case "ArrowDown":
                newPos = Object.assign({}, self.currentPieze.actualPos)
                newPos.y += 1
                resultCheck = self.layout.checkPunch(self.currentPieze.structure, newPos)
                if (resultCheck.isOK === true) {
                    self.currentPieze.down()
                    self.layout.draw(self.currentPieze)
                } else if(resultCheck.destroyPieze === true) {
                    self.destroyPieze()
                }
                break;
        }
        
    }

    

    destroyPieze() {
        clearInterval(this.currentInterval)
        this.layout.AddPiezeToLayout(this.currentPieze, () => {
            this.currentPieze = {}
            // document.removeEventListener('keydown', this.detectMovement, false);
        })

        this.layout.checkRowFilled()
        
        this.newPieze()
    }
    
}

class Pieze {
    colors = [
        '#2B5225',
        '#151551',
        '#AF6F55',
        '#555625'
    ]
    forms = [
        [
            [new Box (), new Box ()],
            [new Box (), new Box ()]
        ],
        [
            [new Box (), new Box (), new Box ()],
            [null,null, new Box ()]
        ],
        [
            [null, new Box (), null],
            [new Box (), new Box (), new Box ()]
        ],
        [
            [new Box (), new Box (), new Box (), new Box ()]
        ],
        [
            [new Box (), new Box (), null],
            [null, new Box (), null],
            [null, new Box (), new Box ()]
        ]
    ]
    structure
    actualPos
    piColor
    size
    constructor (lWidth, lHeight) {
        this.piColor = this.colors[Math.floor(Math.random()*this.colors.length)] 
        this.structure = this.forms[Math.floor(Math.random()*this.forms.length)]
        
        this.getSize()
        this.setInitialPos(lWidth, lHeight)
        this.fillPieze()
        
    }
    getSize() {
        this.size = 0
        this.structure[0].forEach(e => {
            if (e != null ) {
                this.size ++
            } 
        })
    }
    setInitialPos (lWidth, lHeight) {
        let width = lWidth / 2
        width = width - Math.round(this.size / 2)
        this.actualPos = {x:width, y: 0}
    }
    fillPieze () {
        this.structure.forEach ((row, y) => {
            row.forEach ((item, y) => {
                if (item != null) {
                    item.color = this.piColor
                    item.isFilled = 1
                }
            })
        })
    }
    turn () {
        let newStructure = [[]]
        let beforePos = this.actualPos

        this.structure.forEach(e => e.reverse())
        this.structure = this.structure.map((row, i) => {
            row.forEach((e, n) => {
                if (!newStructure[n]) {
                    newStructure[n] = []
                }
                newStructure[n][i] = e
            })
            // newStructure.forEach(e => e.reverse())
            
        })
        this.structure = newStructure

        // Calculamos la posición actual
        let sizeBefore = this.size
        this.getSize()
        
        /* let width
        width = beforePos.x - Math.round((sizeBefore - this.size))
        this.actualPos = {x: width, y: beforePos.y} */

    }
    down () {
        this.actualPos.y ++
    }
    left() {
        this.actualPos.x --
    }
    right() {
        this.actualPos.x ++        
    }
}

class Layout {
    lWidth
    lHeight
    canvasContext
    canvas


    constructor(id, lWidth, lHeight) {
        this.lHeight = lHeight
        this.lWidth = lWidth
        this.matrix = []
        for (let h = 0; h < this.lHeight; h++) {
            this.matrix = [
                ...this.matrix,
                []
            ]
            for (let w = 0; w < this.lWidth; w++) {
                this.matrix[h].push(new Box(0,''))
            }
        }
        this.canvas = document.getElementById(id)
        this.canvasContext = this.canvas.getContext('2d')
        this.canvas.width = this.lWidth * (BLOCKSIZE + 2)
        this.canvas.height = this.lHeight * (BLOCKSIZE + 2)
        // this.canvasContext.scale(BLOCKSIZE, BLOCKSIZE)
    }

    draw(pieze) {
        this.canvasContext.fillStyle = '#000'
        this.canvasContext.fillRect(0,0,this.canvas.width, this.canvas.height)
        // it.fillRect(0, 0, canvas.with, canvas.height)
        this.matrix.forEach((row, y) => {
            row.forEach((item, x) => {
                if (item.isFilled === 1) {
                    this.canvasContext.fillStyle = '#fff'
                    this.canvasContext.fillRect(x * (BLOCKSIZE + 2), y * (BLOCKSIZE + 2), (BLOCKSIZE + 2), (BLOCKSIZE + 2))
                    this.canvasContext.fillStyle = item.color
                    this.canvasContext.fillRect(x * (BLOCKSIZE + 2) + 1, y * (BLOCKSIZE + 2) + 1, (BLOCKSIZE + 2) - 2, (BLOCKSIZE + 2) - 2)
                }
            })
        });
        this.drawPieze(pieze)
    }

    drawPieze (pieze) {

        this.canvasContext.fillStyle = pieze.color

        pieze.structure.forEach((row, y) => {
            row.forEach((item, x) => {
                if (item != null) {
                    /* this.canvasContext.fillStyle = item.color
                    this.canvasContext.fillRect((x + pieze.actualPos.x) * (BLOCKSIZE + 2), (y + pieze.actualPos.y) * (BLOCKSIZE + 2), (BLOCKSIZE + 2), (BLOCKSIZE + 2))
                    */
                    this.canvasContext.fillStyle = '#fff'
                    this.canvasContext.fillRect((x + pieze.actualPos.x) * (BLOCKSIZE + 2), (y + pieze.actualPos.y) * (BLOCKSIZE + 2), (BLOCKSIZE + 2), (BLOCKSIZE + 2))
                    this.canvasContext.fillStyle = item.color
                    this.canvasContext.fillRect((x + pieze.actualPos.x) * (BLOCKSIZE + 2) + 1, (y + pieze.actualPos.y) * (BLOCKSIZE + 2) + 1, (BLOCKSIZE + 2) - 2, (BLOCKSIZE + 2) - 2)
                


                }
            })
        })
        

    }

    

    checkPunch (structure, newPos) {
        // let copyStructure = Object.assign([], structure)
        let copyStructure = [...structure]
        let ok = {isOK: false, destroyPieze: false}
        // Check Left
        if (newPos.x >= 0) {
            ok = {isOK: true, destroyPieze: false}
        }
        
        // Check right
        if (ok.isOK && this.checkRightPunch(copyStructure, newPos)) {
            ok = {isOK: true, destroyPieze: false}
        } else {
            ok = {isOK: false, destroyPieze: false}
        }
        
        // Check down
        if (ok.isOK) {
            if (this.checkDownPunch(copyStructure, newPos)) {
                ok = {isOK: true, destroyPieze: false}
            } else {
                ok = {isOK: false, destroyPieze: true}
            }
        }

        // Check matrix
        if (ok.isOK) {
            ok = this.checkMatrixPunch(copyStructure, newPos)
        }

        return ok
    }

    checkRightPunch (structure, newPos) {
        let isOK = true
        structure.forEach((row, y) => {
            row.forEach((item, x) => {
                if(item != null && newPos.x + x >= this.lWidth) {
                    isOK = false
                }                      
                
            })
        })
        return isOK
    }

    checkMatrixPunch (structure, newPos) {
        let ok = {isOK: true, destroyPieze: false}
        structure.forEach((row, y) => {
            row.forEach((item, x) => {
                if(item != null) {
                    this.matrix.forEach((mrow, my) => {
                        mrow.forEach((el, mx) => {
                            if (el.isFilled === 1) {
                                if(newPos.x + x == mx && newPos.y + y == my) {
                                    ok.isOK = false
                                    if(y == structure.length - 1) {
                                        ok.destroyPieze = true
                                    }
                                }
                            }
                        })
                    });
                } 
            })
        })
        return ok
    }

    checkDownPunch (structure, newPos) {
        let isOK = true
        structure.forEach((row, y) => {
            row.forEach((item, x) => {
                if(item != null && newPos.y + y >= this.lHeight) {
                    isOK = false
                    return false
                }
            })
        })
        return isOK
    }

    AddPiezeToLayout(pieze, callback = {}) {
        pieze.structure.forEach((row, y) => {
            row.forEach((item, x) => {
                if (item != null) {
                    this.matrix[pieze.actualPos.y + y][pieze.actualPos.x + x] = new Box(1, pieze.piColor)
                }
            })
        });
        callback()
    }

    checkRowFilled() {
        let self = this

        this.matrix = this.matrix.filter (row => {
            return (row.filter(e => e.isFilled).length !== self.lWidth)
        })

        for (let index = 0; index < this.lHeight - this.matrix.length; index++) {
            this.matrix.unshift(new Array(this.lWidth))
            
        }
            
        
    }

}

class Converted {
    
}

class Box {
    isFilled = 0
    color = ''
    constructor (isFilled, color) {
        this.isFilled = isFilled
        this.color = color
    }
}

var partidaDeTretix1
window.onload = function(){
    partidaDeTretix1 = new Tetrix('canvastetrix')
}