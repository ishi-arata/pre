# # pip install Flask
# # 
# from multiprocessing import Value
# import requests
# import pymysql.cursors
# from flask import Flask, request

# app = Flask(__name__)

# # DBのコネクションを作成
# # connection = pymysql.connect(
# #     host='localhost',
# #     user='root',
# #     password='',
# #     database='toilet',
# #     cursorclass=pymysql.cursors.DictCursor
# # )



# @app.route('/')
# def index():
#     url = "http://" + "localhost:3000/allget"
#     response = requests.get(url)
#     value = '1'
#     # with connection:
#     #     with connection.cursor() as cursor:
#     #         # データ更新
#     #         sql = "UPDATE toilet_flg SET flg_flg = %s WHERE flg_flg = %s"
#     #         # cursor.execute(sql, (更新したいデータ, 元のデータ))
#     #         cursor.execute(sql, ('0', '1'))
#     #         connection.commit()
#     return

# @app.route('/get', methods=['GET'])
# def get_request():
#     name = request.args['uname']
#     ramp_num = request.args['rnum']
#     return (name + ramp_num)



# if __name__ == '__main__':
#     app.debug=True
#     print("start server")
#     app.run()

import requests
import time
import RPi.GPIO as GPIO

url = "http://" + "localhost:3000/toilet_post"
# response = requests.get(url)
flag = "0"
deviceName = "Toile001"


#ポート番号の定義
Sw_pin = 26
GPIO.setmode(GPIO.BCM)              #GPIOのモードを"GPIO.BCM"に設定
# 使うポートの指定　起動
GPIO.setup(Sw_pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

# deviceNameが空の時だけ名前を聞いてくるようにすればよりシステムぽい汎用性高くなる

while True:
    try:
        # ここで数字が入れ替わる瞬間を判定
        if flag == GPIO.input(Sw_pin):
            # postに格納するデータ
            payload = {
                'dname': deviceName
            }
            # postでリクエストする
            r = requests.post(url, data=payload)
            # flagに今の値を入れて繰り返しが回るようにする
            # flag = GPIO.input(Sw_pin)
            print(GPIO.input(Sw_pin))
            time.sleep(1)
        else:
            time.sleep(1)
            
    except KeyboardInterrupt:
        GPIO.cleanup()