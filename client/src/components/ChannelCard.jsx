const ChannelCard = (props) => {
    const goToChannel = () => {
        window.location.href = props.url;
    }

    return(
        <div onClick={goToChannel}>
            <img src={props.thumbnail} alt="thumbnail" />
            <h3>{props.name}</h3>
            <p>{props.description}</p>
        </div>
    )
}

export default ChannelCard