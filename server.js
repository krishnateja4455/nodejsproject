const http=require('http');
const ejs=require('ejs');
const path=require('path');
const fs=require('fs');
const connection=require('./db');
const url = require('url');
const LocalStrategy=require('passport-local').Strategy;


//Middleware for authentication

const isAuthenticate=(req,res,next)=>{

    let status=false;
    if(status){
        next();
    }else{
        res.writeHead(302,{'Location':'/login'});
        res.end();
    }
}


const server=http.createServer((req,res)=>{

    if(req.url==='/'){

        isAuthenticate(req,res,()=>{

        const filepath=path.join(__dirname,'src','views','index.ejs');

        fs.readFile(filepath,'utf-8',(err,content)=>{     
            
            connection.query('select * from users',(err,results)=>{
                
              if(err){
                console.error('Error querying database:', err); 
                // Send error response to user
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error. Please try again later.');
               
              }

               const renderedHometemplate=ejs.render(content,{results});
               res.end(renderedHometemplate);

            });
            
            
        })
      }) 
    }else if(req.url==='/submit'){
       
           let body='';
           
           req.on('data',(chunk)=>{
                body += chunk.toString();
           })

           req.on('end',()=>{
                 
                const parsedData=new URLSearchParams(body);

                const name=parsedData.get('name');
                const email=parsedData.get('email');
                const address=parsedData.get('address');

                const obj={name,email,address};

                connection.query('insert into users set ?',obj,(error,results)=>{
                    if(error) throw error;
                    console.log(results);
                    res.writeHead(302,{'Location':'/'});
                    res.end();
                })

           })


    }else if(req.url.startsWith('/delete')){

        //try{
        const queryObject=url.parse(req.url,true);       
        let id=queryObject.query.id;
        
        connection.query('delete from users where id=?',[id],(err,results)=>{
                if(err){
                    console.error('Error querying database:', err); 
                    // Send error response to user
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal server issue while deleting.please try again.');
                    return;
                }
                res.writeHead(302,{'Location':'/'});
                res.end();
        })
    /*
    }catch(error){
        console.error('Caught an error:', error); 
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('An unexpected error occurred.');
    }
    */    
  }if(req.url==="/login"){

    const loginfilepath=path.join(__dirname,'src','views','login.ejs');    
    //res.end(loginfilepath);    
    fs.readFile(loginfilepath,'utf-8',(err,content)=>{               
        const renderedlogintemplate=ejs.render(content);
        res.end(renderedlogintemplate);        
    })
         
    
  }
  
  })

const port=4545;
server.listen(port,()=>{
    console.log(`server running at port ${port}`);
})