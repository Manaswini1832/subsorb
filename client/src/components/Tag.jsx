import "./Tag.scss"

const Tag = (props) => {
    return(
        <div className="tag-container" >
            <p>#{props.content}</p> 
        </div>
    )
}

export default Tag;