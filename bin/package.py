#!/usr/bin/env python3

import json
import sys
import os
import traceback
from datetime import datetime
package = json.load(open(sys.argv[1]))


    
    


def assemble(paths,type="js"):
    paths = list(map(lambda path: path if path.startswith("path") else f"src/{path}",paths))
    if type=="js":
        files=[
            f"/* Sunny Road {datetime.now().strftime('%Y')} */\n\n",
            open("src/srd-base/SrdBase.js").read()
        ]
    else:
        files=[
            f"/* Eleanor Cassady {datetime.now().strftime('%Y')} */\n\n",
            open("src/srd-base/base.css").read()
        ]
    for path in paths:
        try:
            if os.path.isfile(path):
                pyf = open(path)
                files.append(f"/* {path.split('/')[-1]}  */")
                files.append(pyf.read())
                pyf.close()
            else:            
                for file in os.scandir(f"{path}"):
                    if file.name.endswith(type):
                        pyf = open(file.path)
                        files.append(f"/* {file.path}  */")
                        files.append(pyf.read())
                        pyf.close()      
        except:
            pass
    return "\n".join(files)

for fileset in package.get("filesets",{}).keys():
    output = open(f"output/widgets-{package.get('name')}.{fileset}","w")
    print(assemble(package["filesets"][fileset],fileset),file=output)
    output.close()