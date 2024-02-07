import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np

fs = 4096 * 2  # Sample rate
seconds = 20

myrecording = sd.rec(int(seconds * fs), samplerate=fs, channels=1)
sd.wait()  # Wait until recording is finished
maxx = -1000
minn = 10000
for i in range(1, len(myrecording)):
    myrecording[i][0]  = np.float32(myrecording[i][0])
    #myrecording[i][1]  = np.float32(myrecording[i][1])
    #minn = min(myrecording[i][1], minn)
   # maxx = max(myrecording[i][1], maxx)
    #if i % 10 < 5:
        #myrecording[i][0] = min(myrecording[i][0] + 0.3, 1)
    #myrecording[i][0] += (myrecording[i][0] - myrecording[i - 1][0])
   # myrecording[i][1] += (myrecording[i][1] - myrecording[i - 1][1])
    #else:
         #myrecording[i][0] = max(myrecording[i][0] - 0.3, -1)

print(maxx, minn)
print(len(myrecording))
print(myrecording)
#write('output{}float16.wav'.format(fs), fs, myrecording)

#with open("data.txt", "r"):
   # myrecording = 
#write('output{}float16.wav'.format(fs), fs, myrecording)