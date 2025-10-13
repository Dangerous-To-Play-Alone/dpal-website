import xml.etree.ElementTree as ET
import re
from random import randrange

css = open("mystyle.css", "w")

pathRegex = re.compile('{\'d\': \'(M0,25.106L-16.987,25.106C-16.987,18.106 -22.031,13.678 -28.254,13.678C-28.284,13.678 -28.313,13.603 -28.343,13.603C-28.289,12.96 -28.254,12.272 -28.254,11.615C-28.254,-0.864 -38.371,-11 -50.85,-11C-60.912,-11 -69.435,-4.431 -72.359,4.66C-74.039,4.023 -75.858,3.668 -77.76,3.668C-84.603,3.668 -90.394,8.171 -92.326,14.378C-93.655,13.828 -95.109,13.519 -96.636,13.519C-102.859,13.519 -107.903,18.563 -107.903,24.786C-107.903,30.292 -103.952,34.895 -98.731,35.877C-98.29,36.007 -97.825,36.106 -97.342,36.106L0,36.106C2.719,36.106 4.431,33.848 4.431,31.129L4.431,29.708C4.431,26.989 2.719,25.106 0,25.106)\', \'style\': \'fill:white;fill-rule:nonzero;\'}')

cloudRegex = re.compile('{\'id\': \'(Cloud[0-9]+)\', \'transform\': \'matrix\((-?\d*\.?\d*),(-?\d*\.?\d*),(-?\d*\.?\d*),(-?\d*\.?\d*),(-?\d*\.?\d*),(-?\d*\.?\d*)\)\'}')
originx = -67.424362
originy = -10.994101

# pathRegex = re.compile("a*")

def findClouds(parent):
    # pathMatch = pathRegex.match("M0,25.106L-16.987,25.106C-16.987,18.106 -22.031,13.678 -28.254,13.678C-28.284,13.678 -28.313,13.603 -28.343,13.603C-28.289,12.96 -28.254,12.272 -28.254,11.615C-28.254,-0.864 -38.371,-11 -50.85,-11C-60.912,-11 -69.435,-4.431 -72.359,4.66C-74.039,4.023 -75.858,3.668 -77.76,3.668C-84.603,3.668 -90.394,8.171 -92.326,14.378C-93.655,13.828 -95.109,13.519 -96.636,13.519C-102.859,13.519 -107.903,18.563 -107.903,24.786C-107.903,30.292 -103.952,34.895 -98.731,35.877C-98.29,36.007 -97.825,36.106 -97.342,36.106L0,36.106C2.719,36.106 4.431,33.848 4.431,31.129L4.431,29.708C4.431,26.989 2.719,25.106 0,25.106")
    for child in parent:
        # print(child.attrib)
        pathMatch = pathRegex.match(str(child.attrib))
        # print(pathRegex)

        # print(pathMatch)
        # print(pathMatch)
        if pathMatch:
            cloudMatch = cloudRegex.match(str(parent.attrib))
            cloudX = float(cloudMatch.group(6))
            turnaroundPercentage = 100 - 100 * (cloudX/1920)
            animationName = "move%s" % cloudMatch.group(1)
            duration = randrange(15, 20)
            topLeft = float(cloudMatch.group(2)) * originx + float(cloudMatch.group(3)) * originy + float(cloudMatch.group(4))
            topRight = float(cloudMatch.group(5)) * originx + float(cloudMatch.group(6)) * originy + float(cloudMatch.group(7))
            # print(topRight)            
            print(topLeft)
            # print(topLeft - topRight)
            lines = [
                "@keyframes %s {" % animationName, 
                "%s {transform: matrix(%s, %s, %s, %s, %d, %s);}" % ("0%", cloudMatch.group(2), cloudMatch.group(3), cloudMatch.group(4), cloudMatch.group(5), cloudX, cloudMatch.group(7)),
                "%s {transform: matrix(%s, %s, %s, %s, %d, %s);}" % (str(turnaroundPercentage)+"%", cloudMatch.group(2), cloudMatch.group(3), cloudMatch.group(4), cloudMatch.group(5), 1920, cloudMatch.group(7)),
                "%s  { opacity: 1; }" % (str(turnaroundPercentage) + "%"),
                "%s { opacity: 0; }" % (str(turnaroundPercentage + .1) + "%"),
                "%s  { opacity: 0; }" % (str(turnaroundPercentage + .9) + "%"),
                "%s { opacity: 1; }" % (str(turnaroundPercentage + 1) + "%"),
                "%s {transform: matrix(%s, %s, %s, %s, %d, %s);}" % (str(turnaroundPercentage + 1)+"%", cloudMatch.group(2), cloudMatch.group(3), cloudMatch.group(4), cloudMatch.group(5), 0 - topLeft, cloudMatch.group(7)),
                "%s {transform: matrix(%s, %s, %s, %s, %d, %s);}" % ("100%", cloudMatch.group(2), cloudMatch.group(3), cloudMatch.group(4), cloudMatch.group(5), cloudX, cloudMatch.group(7)),
                "}",
                "\n",

                "#%s {" % cloudMatch.group(1),
                "animation: %s %ds linear infinite" % (animationName, duration),
                "}",
                "\n"
            ]
            css.write("\n".join(lines))
        findClouds(child)

findClouds(ET.parse("Page3.svg").getroot())
css.close()
