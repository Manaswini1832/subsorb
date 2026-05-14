import "./Tag.scss"

const Tag = (props) => {
    return(
        <div className="tag-container" >
            #{props.content}, 
        </div>
    )
}

export default Tag;