const ChannelCard = (props) => {
    const goToChannel = () => {
        window.location.href = props.url;
    }

    return(
        <div onClick={goToChannel}>
            <h3>{props.name}</h3>
        </div>
    )
}

export default ChannelCard