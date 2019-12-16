import React, { Component, Fragment } from 'react';
import openSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const graphqlQuery = {
      query: `
        {
          user {
            status
          }
        }
      `
    }
    // fetch('http://localhost:8080/auth/status', {
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
       /*  if (res.status !== 200) {
          throw new Error('Failed to fetch user status.');
        }
         */
        return res.json();
      })
      .then(resData => {
        if(resData.errors){
          throw new Error(
            "Status not found."
          );
        }
        this.setState({ status: resData.data.user.status });
      })
      .catch(this.catchError);

    this.loadPosts();
    //abrimos una conexion socket con el server
    //const socket = openSocket('http://localhost:8080');//notese que la peticion socket por primera vez se hace con http normal
    //suscribimos un listener para el channel o evento que especificamos en el backend
    //el segundo argumento es la data que se definió para emitir a los clientes
    /* socket.on('posts', data => {
      if(data.action === 'create'){
        this.addPost(data.post);
        //probamos que funciona usando dos clientes a la vez , por ejemplo en chrome y otro en safari
      }else if(data.action === 'update'){
        this.updatePost(data.post);
      }else if(data.action === 'delete'){
        this.loadPosts();
      }
    }); */
  }

  addPost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      if(prevState.postPage === 1){
        updatedPosts.pop();
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1
      }
    });
  }

  updatePost = post => {
    this.setState(prevState=> {
      const updatedPosts = [...prevState.posts];
      const postIndex = updatedPosts.findIndex(p=>p._id === post._id);
      if(postIndex > -1){
        updatedPosts[postIndex] = post;
      }
      return {
        posts: updatedPosts
      }
    });
  }

  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }

    //usaremos querys nombrados. esto es un feature de GQl
    //notar que tenemos que escribir el tipo de operacion obligatoriamente, asi sea tipo query
    //ponemos el nombre del query(arbitrario) y entre parentesis los argumentos que necesita el query con su data type
    //esos argumentos ya se pueden invocar en el cuerpo del query.
    //Ademas hay que agregar un segundo argumento a graphqlQuery, y se debe llamar exactamente "variables"
    let graphqlQuery = {
      query: `
        query FetchPosts($currPage: Int!){
          posts(page: $currPage) {
            posts{
              title
              _id
              content
              imageUrl
              createdAt
              creator{
                name
              }
            }
            totalPosts
          }
        }
      `,
      variables: {
        //especificamos el mapeo de las variables que usa el query
        //sería:  nombre de variable sin $ : valor que enviaremos
        currPage: page
      }
    }

     //A pesar que esta peticion es GET, es mejor mandar el token
      //por header. para esto hay un header especial
      //Bearer es un prefijo que se agrega por convencion. es opcional pero
      //en nuestro backend lo estamos esperando
    // fetch('http://localhost:8080/feed/posts/?page=' + page, {

    //esta peticion es para GQl
    fetch('http://localhost:8080/graphql', {
      method: "POST" ,
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        /* if (res.status !== 200) {
          throw new Error('Failed to fetch posts.');
        } */
        
        return res.json();
      })
      .then(resData => {
        console.log('Fetched posts', resData);
        if(resData.errors){
          throw new Error(
            "Posts not found."
          );
        }
        this.setState({
          posts: resData.data.posts.posts.map(post => {
            return {
              ...post,
              imageUrl: post.imageUrl
            }
          }),
          totalPosts: resData.data.posts.totalPosts,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();
    const graphqlQuery = {
      query: `
        mutation {
          updateStatus(status: "${this.state.status}") {
            status
          }
        }
      `
    }
    // fetch('http://localhost:8080/auth/status' , {
      fetch('http://localhost:8080/graphql' , {
      // method: "PATCH",
      method: "POST",
     /*  body: JSON.stringify({
        status: this.state.status
      }), */
      body: JSON.stringify(graphqlQuery),
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        "Content-Type" : "application/json"
      }
    })
      .then(res => {
        /* if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        } */
        return res.json();
      })
      .then(resData => {
        if(resData.errors){
          throw new Error(
            "Status updating failed."
          );
        }
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };
      //console.log('startEditPostHandler', loadedPost);
      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    // Set up data (with image!)
    const formData = new FormData();//este objeto es propio del browser y sirve para armar body
    //de una peticion post usando el tipo de encode  multipart, para poder mandar files!!
    // formData.append('title', postData.title);
    // formData.append('content', postData.content);
    formData.append('image', postData.image);
    if(this.state.editPost){
      formData.append('oldPath', this.state.editPost.imageUrl);
      console.log(this.state.editPost);
    }
    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      headers: {
        Authorization: 'Bearer ' + this.props.token
      },
      body: formData
    })
    .then(res => res.json())
    .then(fileResData => {
    //el servicio /post-image devolverá undefined en el filePath si el cliente no envió ningun file pa actualizar
    //y ese valor es el que se envía al siguiente servicio de update. el backend validará eso
    //si es undefined, simplemente asume que la imagen no cambia!
    //cuando la operacion es crear post, entonces siempre se manda una imagen, ese campo es requerido en
    //el frontend
      const imageUrl = fileResData.filePath;

      //usaremos named querys
      //notar que solo usamos las variables con su dollar sign, ya no se necesitan las comillas para armar el query
      //OJO que si los campos del query son requeridos (signo "!") en el schema de mi backend, entonces
      //tambien deben serlo en el named query, sino tira error!!
      let graphqlQuery = {
        query: `
          mutation CreateUserPost ($title: String!, $content: String!, $imageUrl: String!){
            createPost(postInput: {title: $title, 
            content: $content, imageUrl: $imageUrl}){
              _id
              title
              content
              creator {
                name
              }
              createdAt
            }
          }
        `,
        variables: {
          title: postData.title,
          content: postData.content,
          imageUrl: imageUrl
        }
      }

      if(this.state.editPost){
        graphqlQuery = {
          query: `
            mutation {
              updatePost(id: "${this.state.editPost._id}" ,postInput: {title: "${postData.title}", 
              content: "${postData.content}", imageUrl: "${imageUrl}"}){
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
            }
          `
        }
      }
  

    // let url = 'http://localhost:8080/feed/post';
    // let method = 'POST';
    // if (this.state.editPost) {
    //   url = 'http://localhost:8080/feed/post/' + this.state.editPost._id;
    //   method = 'PUT';
    //}

      return fetch("http://localhost:8080/graphql", {
        //method: method,
        //body: formData,//usando FormData, ya no es necesario definir las cabeceras multipart
        method: "POST",
        body: JSON.stringify(graphqlQuery),
        headers : {
          Authorization: 'Bearer ' + this.props.token,
          "Content-Type" : "application/json"
        }
        
      })
    })

      .then(res => {
       /*  if (res.status !== 200 && res.status !== 201) {
          throw new Error('Creating or editing a post failed!');
        } */
        return res.json();
      })
      .then(resData => {
        if(resData.errors && resData.errors[0].code === 401){
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if(resData.errors){
          throw new Error(
            "Post creation failed."
          );
        }
        console.log(resData);
        let resDataField = "createPost";
        if(this.state.editPost){
          resDataField = "updatePost";
        }
        const post = {
          _id: resData.data[resDataField]._id,
          title: resData.data[resDataField].title,
          content: resData.data[resDataField].content,
          imageUrl: resData.data[resDataField].imageUrl,
          creator: resData.data[resDataField].creator ? resData.data[resDataField].creator.name : null,
          createdAt: resData.data[resDataField].createdAt
        };
        this.setState(prevState => {
          const updatedPosts = [...prevState.posts];
          if(prevState.editPost){
            const postIndex = prevState.posts.findIndex(p=>{
              return p._id === prevState.editPost._id;
            });
            updatedPosts[postIndex] = post;
          }else{
            updatedPosts.pop();
            updatedPosts.unshift(post);
          }
          return {
            posts:updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });

    const graphqlQuery = {
      query: `
        mutation {
          deletePost(id: "${postId}")
        }
      `
    }

    fetch('http://localhost:8080/graphql', {
      method: "POST",
      headers : {
        Authorization: 'Bearer ' + this.props.token,
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        /* if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        } */
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        if(resData.errors){
          throw new Error(
            "Post deletion failed."
          );
        }
        this.loadPosts();//como el backend ya notifica inmediatamente el delete
        //entonces bsatará con recagrgar la pagina cargando los posts y ahi ya se habra eliminado el post!!

        // this.setState(prevState => {
        //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post 
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator !== undefined ? post.creator.name : null}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
