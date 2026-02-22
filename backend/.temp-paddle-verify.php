
            <?php
            $data = file_get_contents('/Users/Shared/Projects/evntaly-backend/.temp-paddle-data.txt');
            $signature = file_get_contents('/Users/Shared/Projects/evntaly-backend/.temp-paddle-signature.txt');
            $key = file_get_contents('/Users/Shared/Projects/evntaly-backend/.temp-paddle-key.pem');
            
            $result = openssl_verify($data, base64_decode($signature), $key);
            echo $result;
            ?>
            