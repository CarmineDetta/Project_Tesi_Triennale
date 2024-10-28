Questa sezione si interessa a dare un aiuto su come configurare correttamente il proggetto e poter avviare con successo la WebApp.
Tutti i link e le risorse si possono trovare sulla tesi completa.

Il progetto utilizza React, e questo vorrà dire che una volta aperto il progetto, per far in modo che esso venga avviato correttamente, bisogna scaricare tutte le dipendenze del caso.
Questo `e possibile attraverso il comando ”npm install” lanciato nel terminale sulla pagina ”package.json”, nel caso ci fossero dei pacchetti che non vengono installati correttamente,
lanciare il comando ”npm install - - force” sulla stessa pagina.

Una volta scaricato il progetto correttamente e le varie dipendenze associate, bisogna eseguirlo, per poterlo fare c’`e bisogno di vari passaggi utili.

Infatti come prima cosa bisogna avviare il semplice progetto con il comando banale di React quale ”npm start” sulla stessa pagina dove abbiamo installato le dipendenze, inoltre bisogna
ricordarsi che serve avviare i due Server di Flask con la quale gestiamo il codice Python e i modelli di Machine Learning.

Questo lo facciamo innanzitutto aprendo sul terminale la cartella che racchiude il Server che vogliamo avviare, una volta aperto, lanciamo il comando:
”source ambiente virt flask/bin/activate”. 

Ciò ci consentirà di aprire lo spazio virtuale utilizzato per Flask, e in seguito lanceremo i due Server interessati alla predizione e all’addestramento con ”python nomeServer.py” 
(ovviamente se i server sono due, fare due volte questo passaggio).

Così facendo la WebApp si avvierà con successo